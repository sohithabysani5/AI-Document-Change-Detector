import { useState } from 'react'
import './index.css'

function App() {
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file1 || !file2) return
    
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('version1', file1)
    formData.append('version2', file2)

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'The documents could not be analyzed.')
      }
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to the analysis service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-navy text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-brand-teal">AI Document Change Detector</h1>
      </header>

      <main className="flex-grow p-8 max-w-5xl mx-auto w-full">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Compare Documents</h2>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Version 1 (Original)</label>
                <input type="file" onChange={e => setFile1(e.target.files?.[0] || null)} className="w-full" />
              </div>
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Version 2 (Updated)</label>
                <input type="file" onChange={e => setFile2(e.target.files?.[0] || null)} className="w-full" />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={!file1 || !file2 || loading}
              className="w-full bg-brand-violet hover:bg-brand-teal transition-colors text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Changes'}
            </button>
          </form>
          {error && <p role="alert" className="mt-4 text-red-700">{error}. Make sure the backend is running on port 8000.</p>}
        </div>

        {report && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Semantic Change Report</h2>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-brand-teal">
              <p className="text-gray-700">{report.summary}</p>
            </div>
            
            <div className="space-y-6">
              {report.changes.map((change: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">{change.section}</h3>
                    <span className="bg-brand-violet text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                      {change.change_type}
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">{change.explanation}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-50 p-4 rounded text-red-900">
                        <span className="font-bold block mb-2">Version 1:</span>
                        {change.v1_evidence}
                      </div>
                      <div className="bg-green-50 p-4 rounded text-green-900">
                        <span className="font-bold block mb-2">Version 2:</span>
                        {change.v2_evidence}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
