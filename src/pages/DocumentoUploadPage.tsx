import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDocumentUpload } from '@/hooks/useDocumentUpload'
import type { ParentType } from '@/types/document'

const CATEGORIES = ['contratto', 'fattura', 'ricevuta', 'documento-identita', 'altro']
const PARENT_TYPES: Array<{ value: ParentType; label: string }> = [
  { value: 'ENTITY', label: 'Anagrafica' },
  { value: 'INVOICE', label: 'Fattura' },
  { value: 'PROJECT', label: 'Progetto' },
]

export function DocumentoUploadPage() {
  const navigate = useNavigate()
  const { state, upload, reset } = useDocumentUpload()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    category: CATEGORIES[0],
    parentType: 'ENTITY' as ParentType,
    parentId: '',
    description: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f: File) => setFile(f)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !form.parentId.trim()) return
    await upload(file, {
      category: form.category,
      parentType: form.parentType,
      parentId: form.parentId.trim(),
      description: form.description,
    })
  }

  if (state.status === 'done') {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Documento caricato</h2>
        <p className="text-sm text-gray-500">ID: <span className="font-mono text-xs">{state.documentId}</span></p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Carica altro</button>
          <Link to={`/documenti/${state.documentId}`} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">Vedi documento</Link>
          <Link to="/documenti" className="px-4 py-2 text-sm text-primary hover:underline">Lista</Link>
        </div>
      </div>
    )
  }

  const isLoading = ['requesting', 'uploading', 'finalizing'].includes(state.status)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/documenti" className="text-sm text-primary hover:underline">← Documenti</Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Carica documento</h1>
        <p className="text-sm text-gray-500 mt-1">Upload in 3 step: firma URL → upload su GCS → salvataggio metadati</p>
      </div>

      {/* Progress steps */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                {state.status === 'requesting' && 'Richiesta URL firmato...'}
                {state.status === 'uploading' && 'Upload su Google Cloud Storage...'}
                {state.status === 'finalizing' && 'Salvataggio metadati...'}
              </p>
              <div className="mt-1.5 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-blue-600 font-medium">{state.progress}%</span>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {state.error}
          <button onClick={reset} className="ml-3 underline text-xs">Riprova</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          } ${file ? 'border-green-400 bg-green-50' : ''}`}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {file ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-700">{file.name}</p>
              <p className="text-xs text-green-500">{(file.size / 1024).toFixed(1)} KB — {file.type}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <p className="text-sm text-gray-600">Trascina un file o <span className="text-primary font-medium">sfoglia</span></p>
              <p className="text-xs text-gray-400">Qualsiasi tipo di file</p>
            </div>
          )}
        </div>

        {/* Metadati */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Metadati</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoria *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo entità *</label>
              <select
                value={form.parentType}
                onChange={e => setForm(f => ({ ...f, parentType: e.target.value as ParentType }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {PARENT_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">ID entità *</label>
              <input
                type="text"
                value={form.parentId}
                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                placeholder="es. abc123..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrizione</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descrizione opzionale del documento"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || !form.parentId.trim() || isLoading}
          className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Caricamento in corso…' : 'Carica documento'}
        </button>
      </form>
    </div>
  )
}
