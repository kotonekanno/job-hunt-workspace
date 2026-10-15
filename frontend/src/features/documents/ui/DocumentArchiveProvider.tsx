import { useCallback, type ReactNode } from 'react';
import * as api from '@/api/generated/api';
import { authenticatedRequest } from '@/api/authenticatedRequest';
import { requireStatus, useApiResource } from '@/api/useApiResource';
import type { Document, UpdateDocumentRequest } from '@/api/generated/models';
import { DocumentArchiveContext } from '../model/DocumentArchiveContext';

export function DocumentArchiveProvider({ children }: { children: ReactNode }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await authenticatedRequest(api.getDocuments, { signal });
    if (response.status !== 200)
      throw new Error('ドキュメント一覧を取得できませんでした。');
    // The list has no body; keep detail responses separately for full-text search.
    const contents: Record<number, Document> = {};
    await Promise.all(
      response.data.documents.map(async (item) => {
        const detail = await authenticatedRequest(
          (options) => api.getDocumentById(item.id, options),
          { signal },
        );
        if (detail.status !== 200)
          throw new Error('ドキュメント本文を取得できませんでした。');
        contents[item.id] = detail.data;
      }),
    );
    return { documents: response.data.documents, contents };
  }, []);
  const resource = useApiResource(loader);
  const documents = resource.data?.documents ?? [];
  async function addDocument(title: string) {
    requireStatus(
      await authenticatedRequest((options) =>
        api.createDocument({ title }, options),
      ),
      201,
    );
    await resource.refresh();
  }
  async function updateDocument(id: number, patch: UpdateDocumentRequest) {
    requireStatus(
      await authenticatedRequest((options) =>
        api.patchDocument(id, patch, options),
      ),
    );
    resource.setData((current) => {
      const document = current?.contents[id];
      if (!current || !document) return current;
      return {
        documents: current.documents.map((item) =>
          item.id === id ? { ...item, title: patch.title ?? item.title } : item,
        ),
        contents: { ...current.contents, [id]: { ...document, ...patch } },
      };
    });
  }
  async function deleteDocument(id: number) {
    requireStatus(
      await authenticatedRequest((options) => api.deleteDocument(id, options)),
    );
    await resource.refresh();
  }
  async function reorderDocuments(ids: number[]) {
    try {
      // Apply relative positions from the end so every next ID already has its final position.
      for (let index = ids.length - 1; index >= 0; index--) {
        requireStatus(
          await authenticatedRequest((options) =>
            api.reorderDocument(
              ids[index],
              { nextDocumentId: ids[index + 1] ?? null },
              options,
            ),
          ),
        );
      }
    } finally {
      await resource.refresh();
    }
  }
  return (
    <DocumentArchiveContext.Provider
      value={{
        documents,
        contents: resource.data?.contents ?? {},
        isLoading: resource.isLoading,
        error: resource.error,
        addDocument,
        updateDocument,
        deleteDocument,
        reorderDocuments,
      }}
    >
      {children}
    </DocumentArchiveContext.Provider>
  );
}
