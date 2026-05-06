import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocuments } from '@/hooks/useDocuments'
import { DOCUMENT_STATUS_LABEL, DOCUMENT_STATUS_COLOR } from '@/types/document'
import type { DocumentListParams, DocumentStatus, ParentType } from '@/types/document'

const CATEGORIES = ['', 'contratto', 'fattura', 'ricevuta', 'documento-identita', 'altro']
const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'DRAFT', label: 'Bozza' },
  { value: 'PENDING', label: 'In attesa' },
  { value: 'APPROVED', label: 'Approvato' },
  { value: 'REJECTED', label: 'Rifiutato' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentiPage() {
  const [filters, setFilters] = useState<DocumentListParams>({ limit: 20, offset: 0 })
  const { documents, loading, error, reload } = useDocuments(filters)

  const setFilter = (key: keyof DocumentListParams, value: string | number | undefined) => {
    setFilters(f => ({ ...f, [key]: value || undefined, offset: 0 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documenti</h1>
          <p className="text-sm text-gray-500 mt-1">Gestisci i documenti del sistema Nexus</p>
        </div>
        <Link
          to="/documenti/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Carica documento
        </Link>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo entità</label>
            <select
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              onChange={e => setFilter('parentType', e.target.value as ParentType)}
            >
              <option value="">Tutti</option>
              <option value="ENTITY">Anagrafica</option>
              <option value="INVOICE">Fattura</option>
              <option value="PROJECT">Progetto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stato</label>
            <select
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              onChange={e => setFilter('status', e.target.value as DocumentStatus)}
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
            <select
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              onChange={e => setFilter('category', e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c || 'Tutte le categorie'}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={reload}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              Aggiorna
            </button>
          </div>
        </div>
      </div>

      {/* Stato */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      {/* Tabella */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm font-medium text-gray-600">Nessun documento trovato</p>
            <p className="text-xs text-gray-400 mt-1">Modifica i filtri o carica il primo documento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome file</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensione</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entità</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-xs">{doc.fileName}</div>
                      {doc.description && <div className="text-xs text-gray-400 truncate">{doc.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DOCUMENT_STATUS_COLOR[doc.status]}`}>
                        {DOCUMENT_STATUS_LABEL[doc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatBytes(doc.size)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="text-xs bg-gray-100 rounded px-1.5 py-0.5">{doc.relation.parentType}</span>
                      <span className="ml-1 text-gray-400 font-mono text-xs">{doc.relation.parentId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/documenti/${doc.id}`}
                        className="text-primary hover:text-primary/70 text-xs font-medium"
                      >
                        Dettaglio
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginazione semplice */}
      {!loading && documents.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{documents.length} documenti</span>
          <div className="flex gap-2">
            <button
              disabled={(filters.offset ?? 0) === 0}
              onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, (f.offset ?? 0) - (f.limit ?? 20)) }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Precedente
            </button>
            <button
              disabled={documents.length < (filters.limit ?? 20)}
              onClick={() => setFilters(f => ({ ...f, offset: (f.offset ?? 0) + (f.limit ?? 20) }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Successiva
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
