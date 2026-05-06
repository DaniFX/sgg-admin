import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDocument } from '@/hooks/useDocuments'
import { documentsApi } from '@/lib/documentsApi'
import { DOCUMENT_STATUS_LABEL, DOCUMENT_STATUS_COLOR } from '@/types/document'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { document, loading, error } = useDocument(id ?? null)
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDownload = async () => {
    if (!id) return
    setDownloading(true)
    try {
      const { downloadUrl } = await documentsApi.getDownloadURL(id)
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      alert('Errore generazione URL download')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Eliminare definitivamente il documento?')) return
    setDeleting(true)
    try {
      await documentsApi.delete(id)
      navigate('/documenti')
    } catch (e) {
      alert('Errore eliminazione documento')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="space-y-4">
        <Link to="/documenti" className="text-sm text-primary hover:underline">← Torna ai documenti</Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error ?? 'Documento non trovato'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <Link to="/documenti" className="text-sm text-primary hover:underline">← Documenti</Link>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {downloading ? 'Generazione URL…' : 'Scarica'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
          >
            {deleting ? 'Eliminazione…' : 'Elimina'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{document.fileName}</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DOCUMENT_STATUS_COLOR[document.status]}`}>
            {DOCUMENT_STATUS_LABEL[document.status]}
          </span>
        </div>
        <dl className="divide-y divide-gray-100">
          {document.description && (
            <div className="px-6 py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm text-gray-500">Descrizione</dt>
              <dd className="text-sm text-gray-900 col-span-2">{document.description}</dd>
            </div>
          )}
          <div className="px-6 py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm text-gray-500">Categoria</dt>
            <dd className="text-sm text-gray-900 col-span-2">{document.category}</dd>
          </div>
          <div className="px-6 py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm text-gray-500">MIME type</dt>
            <dd className="text-sm text-gray-900 col-span-2 font-mono">{document.mimeType}</dd>
          </div>
          <div className="px-6 py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm text-gray-500">Dimensione</dt>
            <dd className="text-sm text-gray-900 col-span-2">{formatBytes(document.size)}</dd>
          </div>
          <div className="px-6 py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm text-gray-500">Entità</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              <span className="text-xs bg-gray-100 rounded px-1.5 py-0.5 mr-2">{document.relation.parentType}</span>
              <span className="font-mono text-xs text-gray-500">{document.relation.parentId}</span>
            </dd>
          </div>
          <div className="px-6 py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm text-gray-500">Creato il</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {new Date(document.createdAt).toLocaleString('it-IT')}
            </dd>
          </div>
          {document.createdBy && (
            <div className="px-6 py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm text-gray-500">Creato da</dt>
              <dd className="text-sm text-gray-900 col-span-2 font-mono text-xs">{document.createdBy}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
