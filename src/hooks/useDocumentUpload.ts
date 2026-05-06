import { useState } from 'react'
import { documentsApi } from '@/lib/documentsApi'
import type { UploadURLRequest, ParentType } from '@/types/document'

export type UploadStatus = 'idle' | 'requesting' | 'uploading' | 'finalizing' | 'done' | 'error'

export interface UploadState {
  status: UploadStatus
  progress: number        // 0-100, step-based
  documentId: string | null
  error: string | null
}

export function useDocumentUpload() {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    documentId: null,
    error: null,
  })

  const reset = () => setState({ status: 'idle', progress: 0, documentId: null, error: null })

  const upload = async (
    file: File,
    opts: { category: string; parentType: ParentType; parentId: string; description?: string }
  ) => {
    setState({ status: 'requesting', progress: 10, documentId: null, error: null })
    try {
      // Step 1 — richiedi Signed URL al backend
      const req: UploadURLRequest = {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        category: opts.category,
        parentType: opts.parentType,
        parentId: opts.parentId,
      }
      const { docId, uploadUrl, storagePath } = await documentsApi.requestUploadURL(req)

      // Step 2 — upload diretto su GCS (nessun token, nessun gateway)
      setState(s => ({ ...s, status: 'uploading', progress: 40 }))
      await documentsApi.uploadToGCS(uploadUrl, file)

      // Step 3 — finalizza metadati su Firestore
      setState(s => ({ ...s, status: 'finalizing', progress: 80 }))
      const result = await documentsApi.finalize({
        docId,
        fileName: file.name,
        description: opts.description,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        storagePath,
        category: opts.category,
        parentType: opts.parentType,
        parentId: opts.parentId,
      })

      setState({ status: 'done', progress: 100, documentId: result.id, error: null })
    } catch (e) {
      setState({ status: 'error', progress: 0, documentId: null, error: e instanceof Error ? e.message : 'Errore upload' })
    }
  }

  return { state, upload, reset }
}
