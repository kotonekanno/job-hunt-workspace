import {
  getDocuments,
  getDocumentById,
  createDocument,
  patchDocument,
  deleteDocument,
  reorderDocument,
} from '@/api/generated/api';
import type { CreateDocumentRequest } from '@/api/generated/models/createDocumentRequest';
import type { UpdateDocumentRequest } from '@/api/generated/models/updateDocumentRequest';
import type { ReorderDocumentBody } from '@/api/generated/models/reorderDocumentBody';
import { getAccessToken } from '@/features/auth/model/accessToken';

function options(signal?: AbortSignal): RequestInit {
  const token = getAccessToken();
  return {
    signal,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

export class DocumentApiError extends Error {
  constructor(public status: number) {
    super(`Document API failed: ${status}`);
  }
}

export async function fetchDocuments(signal?: AbortSignal) {
  const response = await getDocuments(options(signal));
  if (response.status !== 200) throw new DocumentApiError(response.status);
  return response.data.documents;
}

export async function fetchDocument(id: number, signal?: AbortSignal) {
  const response = await getDocumentById(id, options(signal));
  if (response.status !== 200) throw new DocumentApiError(response.status);
  return response.data;
}

export async function createDocumentRequest(title: string) {
  const request: CreateDocumentRequest = { title };
  const response = await createDocument(request, options());
  if (response.status !== 201) throw new DocumentApiError(response.status);
  return response.data.documentId;
}

export async function updateDocumentRequest(
  id: number,
  request: UpdateDocumentRequest,
) {
  const response = await patchDocument(id, request, options());
  if (response.status !== 204) throw new DocumentApiError(response.status);
}

export async function deleteDocumentRequest(id: number) {
  const response = await deleteDocument(id, options());
  if (response.status !== 204) throw new DocumentApiError(response.status);
}

// List order is represented by array order, not a synthetic position field.
export async function persistDocumentOrder(
  previous: number[],
  desired: number[],
  onProgress?: (ids: number[]) => void,
  movedId?: number,
) {
  if (
    previous.length !== desired.length ||
    new Set(desired).size !== desired.length ||
    desired.some((id) => !previous.includes(id))
  ) {
    throw new Error('Invalid document order');
  }
  const current = [...previous];
  for (let index = desired.length - 1; index >= 0; index -= 1) {
    const id = desired[index];
    if (movedId !== undefined && id !== movedId) continue;
    const nextDocumentId = desired[index + 1] ?? null;
    const oldIndex = current.indexOf(id);
    if ((current[oldIndex + 1] ?? null) === nextDocumentId) continue;
    const request: ReorderDocumentBody = { nextDocumentId };
    const response = await reorderDocument(id, request, options());
    if (response.status !== 204) throw new DocumentApiError(response.status);
    current.splice(oldIndex, 1);
    current.splice(
      nextDocumentId === null
        ? current.length
        : current.indexOf(nextDocumentId),
      0,
      id,
    );
    onProgress?.([...current]);
  }
}
