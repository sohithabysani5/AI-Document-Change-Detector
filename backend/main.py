from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import time
import os

app = FastAPI(title="AI Document Change Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChangeReport(BaseModel):
    summary: str
    changes: list
    unchanged_sections: list

@app.get("/health")
def health_check():
    return {"status": "healthy"}

import docx2txt
import pdfplumber
import difflib
import io

def extract_text(file: UploadFile, content: bytes) -> str:
    text = ""
    filename = file.filename.lower()
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    elif filename.endswith(".docx"):
        text = docx2txt.process(io.BytesIO(content))
    else:
        text = content.decode("utf-8", errors="ignore")
    return text

@app.post("/api/compare", response_model=ChangeReport)
async def compare_documents(
    version1: UploadFile = File(...),
    version2: UploadFile = File(...)
):
    if not version1.filename or not version2.filename:
        raise HTTPException(status_code=400, detail="Missing file")
        
    v1_content = await version1.read()
    v2_content = await version2.read()
    
    t1 = extract_text(version1, v1_content)
    t2 = extract_text(version2, v2_content)

    lines1 = [line.strip() for line in t1.split("\n") if line.strip()]
    lines2 = [line.strip() for line in t2.split("\n") if line.strip()]

    changes = []
    unchanged = []
    
    matcher = difflib.SequenceMatcher(None, lines1, lines2)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == 'equal':
            for line in lines1[i1:i2]:
                if len(line) > 20:
                    unchanged.append(line[:50] + "...")
        elif tag == 'replace':
            changes.append({
                "section": f"Paragraph {i1+1}",
                "change_type": "Modified",
                "severity": "Medium",
                "v1_evidence": " ".join(lines1[i1:i2]),
                "v2_evidence": " ".join(lines2[j1:j2]),
                "explanation": "Content was changed.",
                "importance": "Meaning may be altered."
            })
        elif tag == 'delete':
            changes.append({
                "section": f"Paragraph {i1+1}",
                "change_type": "Removed",
                "severity": "High",
                "v1_evidence": " ".join(lines1[i1:i2]),
                "v2_evidence": "(Removed)",
                "explanation": "Content was deleted in the new version.",
                "importance": "Missing information."
            })
        elif tag == 'insert':
            changes.append({
                "section": f"Paragraph {j1+1} (New)",
                "change_type": "Added",
                "severity": "Medium",
                "v1_evidence": "(None)",
                "v2_evidence": " ".join(lines2[j1:j2]),
                "explanation": "New content was added.",
                "importance": "New information introduced."
            })
            
    summary = f"Compared '{version1.filename}' vs '{version2.filename}'. Found {len(changes)} changes."
    
    return ChangeReport(
        summary=summary,
        changes=changes,
        unchanged_sections=unchanged[:5] # Limit to top 5
    )
