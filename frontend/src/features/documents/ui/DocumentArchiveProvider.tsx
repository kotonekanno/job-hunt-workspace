import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as api from '@/api/generated/api';
import type {
  DocumentListItem,
  UpdateDocumentRequest,
} from '@/api/generated/models';
import { authenticatedRequest } from '@/api/authenticatedRequest';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DocumentArchiveContext } from '@/features/documents/model/DocumentArchiveContext';

export function DocumentArchiveProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const reordering = useRef(false);
  useEffect(() => {
    if (auth.status !== 'authenticated') {
      setDocuments([]);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    async function load() {
      try {
        const response = await authenticatedRequest(
          (options) => api.getDocuments(options),
          { signal: controller.signal },
        );
        if (response.status !== 200) throw new Error();
        if (!controller.signal.aborted) setDocuments(response.data.documents);
      } catch {
        if (!controller.signal.aborted)
          setError('ドキュメント一覧を取得できませんでした。');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [auth.status]);
  async function perform(operation: () => Promise<void>) {
    setError('');
    try {
      await operation();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'ドキュメントを更新できませんでした。',
      );
      throw cause;
    }
  }
  async function addDocument(title: string) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.createDocument({ title }, options),
      );
      if (response.status !== 201)
        throw new Error('ドキュメントを追加できませんでした。');
      setDocuments((current) => [
        ...current,
        { id: response.data.documentId, title },
      ]);
    });
  }
  const loadDocument = useCallback(async (id: number, signal?: AbortSignal) => {
    if (!Number.isSafeInteger(id) || id < 1)
      throw new Error('ドキュメントIDが不正です。');
    const response = await authenticatedRequest(
      (options) => api.getDocumentById(id, options),
      { signal },
    );
    if (response.status !== 200)
      throw new Error(
        response.status === 404
          ? 'ドキュメントが見つかりませんでした。'
          : 'ドキュメントを取得できませんでした。',
      );
    return response.data;
  }, []);
  async function updateDocument(id: number, patch: UpdateDocumentRequest) {
    if (!Object.keys(patch).length) return;
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.patchDocument(id, patch, options),
      );
      if (response.status !== 204)
        throw new Error('ドキュメントを保存できませんでした。');
      if (patch.title !== undefined)
        setDocuments((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, title: patch.title ?? item.title }
              : item,
          ),
        );
    });
  }
  async function deleteDocument(id: number) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.deleteDocument(id, options),
      );
      if (response.status !== 204)
        throw new Error('ドキュメントを削除できませんでした。');
      setDocuments((current) => current.filter((item) => item.id !== id));
    });
  }
  async function reorderDocuments(ids: number[]) {
    if (reordering.current) throw new Error('並べ替えを保存中です。');
    reordering.current = true;
    try {
      await perform(async () => {
        const working = documents.map((item) => item.id);
        for (let index = ids.length - 1; index >= 0; index--) {
          const id = ids[index];
          const next = ids[index + 1] ?? null;
          const oldIndex = working.indexOf(id);
          if (oldIndex < 0 || (working[oldIndex + 1] ?? null) === next)
            continue;
          const response = await authenticatedRequest((options) =>
            api.reorderDocument(id, { nextDocumentId: next }, options),
          );
          if (response.status !== 204) {
            const actual = await authenticatedRequest((options) =>
              api.getDocuments(options),
            );
            if (actual.status === 200) setDocuments(actual.data.documents);
            throw new Error('並べ替えを保存できませんでした。');
          }
          working.splice(oldIndex, 1);
          working.splice(
            next === null ? working.length : working.indexOf(next),
            0,
            id,
          );
        }
        setDocuments((current) =>
          ids.flatMap((id) => current.filter((item) => item.id === id)),
        );
      });
    } finally {
      reordering.current = false;
    }
  }
  return (
    <DocumentArchiveContext.Provider
      value={{
        documents,
        isLoading,
        error,
        addDocument,
        loadDocument,
        updateDocument,
        deleteDocument,
        reorderDocuments,
      }}
    >
      {children}
    </DocumentArchiveContext.Provider>
  );
}
