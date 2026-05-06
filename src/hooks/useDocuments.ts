import { useState, useEffect, useCallback } from 'react'
import { documentsApi } from '@/lib/documentsApi'
import type { Document, DocumentListParams } from '@/types/document'

export function useDocuments(params: DocumentListParams = {}) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const key = JSON.stringify(params)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentsApi.list(params)
      setDocuments(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento documenti')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => { load() }, [load])

  return { documents, loading, error, reload: load }
}

export function useDocument(id: string | null) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    documentsApi.get(id)
      .then(setDocument)
      .catch(e => setError(e instanceof Error ? e.message : 'Errore'))
      .finally(() => setLoading(false))
  }, [id])

  return { document, loading, error }
}
