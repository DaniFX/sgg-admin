// Tipi allineati al modello Go del document-service

export type DocumentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

export type ParentType = 'ENTITY' | 'INVOICE' | 'PROJECT'

export interface DocumentRelation {
  parentType: ParentType
  parentId: string
}

export interface Document {
  id: string
  fileName: string
  description?: string
  mimeType: string
  size: number
  storagePath: string
  category: string
  status: DocumentStatus
  metadata?: Record<string, unknown>
  relation: DocumentRelation
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface DocumentListParams {
  parentType?: ParentType
  parentId?: string
  status?: DocumentStatus
  category?: string
  limit?: number
  offset?: number
}

export interface UploadURLRequest {
  fileName: string
  mimeType: string
  category: string
  parentType: ParentType
  parentId: string
}

export interface UploadURLResponse {
  docId: string
  uploadUrl: string
  storagePath: string
}

export interface FinalizeRequest {
  docId: string
  fileName: string
  description?: string
  mimeType: string
  size: number
  storagePath: string
  category: string
  parentType: ParentType
  parentId: string
}

export interface DownloadURLResponse {
  id: string
  fileName: string
  downloadUrl: string
  expiresIn: string
}

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  DRAFT: 'Bozza',
  PENDING: 'In attesa',
  APPROVED: 'Approvato',
  REJECTED: 'Rifiutato',
}

export const DOCUMENT_STATUS_COLOR: Record<DocumentStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}
