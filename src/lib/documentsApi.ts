import { auth } from '@/lib/firebase'
import type {
  Document,
  DocumentListParams,
  UploadURLRequest,
  UploadURLResponse,
  FinalizeRequest,
  DownloadURLResponse,
} from '@/types/document'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || '/api'
const BASE = `${GATEWAY_URL}/v1/documents`

async function headers(): Promise<HeadersInit> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const token = await user.getIdToken()
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json()
  if (!res.ok || !body.success) throw new Error(body.error?.message || `HTTP ${res.status}`)
  return body.data as T
}

export const documentsApi = {
  /** Lista documenti con filtri Navigator (parentType, parentId, status, category, limit, offset) */
  async list(params: DocumentListParams = {}): Promise<Document[]> {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)))
    const res = await fetch(`${BASE}?${qs.toString()}`, { headers: await headers() })
    return handle<Document[]>(res)
  },

  /** Dettaglio singolo documento */
  async get(id: string): Promise<Document> {
    const res = await fetch(`${BASE}/${id}`, { headers: await headers() })
    return handle<Document>(res)
  },

  /** Step 1 upload: ottieni Signed URL PUT da GCS */
  async requestUploadURL(req: UploadURLRequest): Promise<UploadURLResponse> {
    const res = await fetch(`${BASE}/upload-url`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify(req),
    })
    return handle<UploadURLResponse>(res)
  },

  /** Step 2 upload: PUT diretto su GCS — NON passa per il gateway */
  async uploadToGCS(uploadUrl: string, file: File): Promise<void> {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!res.ok) throw new Error(`GCS upload failed: HTTP ${res.status}`)
  },

  /** Step 3 upload: finalizza e persisti metadati su Firestore */
  async finalize(req: FinalizeRequest): Promise<{ id: string; status: string }> {
    const res = await fetch(`${BASE}/finalize`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify(req),
    })
    return handle<{ id: string; status: string }>(res)
  },

  /** Genera Signed URL GET per download/visualizzazione (valido 60 min) */
  async getDownloadURL(id: string): Promise<DownloadURLResponse> {
    const res = await fetch(`${BASE}/${id}/download-url`, { headers: await headers() })
    return handle<DownloadURLResponse>(res)
  },

  /** Soft delete documento */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'DELETE',
      headers: await headers(),
    })
    if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`)
  },
}
