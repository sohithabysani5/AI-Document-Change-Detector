from fastapi.testclient import TestClient
from backend.main import app
import io

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_compare_documents():
    file1 = ("v1.txt", io.BytesIO(b"Hello world"), "text/plain")
    file2 = ("v2.txt", io.BytesIO(b"Hello world 2"), "text/plain")
    response = client.post("/api/compare", files={"version1": file1, "version2": file2})
    
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "changes" in data
