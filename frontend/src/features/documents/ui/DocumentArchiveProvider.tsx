import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Document } from '@/api/generated/models/document';
import type { DocumentListItem } from '@/api/generated/models/documentListItem';
import { DocumentArchiveContext } from '@/features/documents/model/DocumentArchiveContext';
import {
  createDocumentRequest,
  deleteDocumentRequest,
  fetchDocument,
  fetchDocuments,
  persistDocumentOrder,
  updateDocumentRequest,
} from '@/features/documents/lib/documentApi';
import { useAccessToken } from '@/features/auth/model/accessToken';
import { DocumentSaveSession } from '@/features/documents/lib/documentSaveSession';
import { toast } from '@/shared/toast';

export function DocumentArchiveProvider({ children }: { children: ReactNode }) {
  const token = useAccessToken();
  // Discard cached documents and drafts when the authenticated session changes.
  return (
    <DocumentSession key={token ?? 'anonymous'}>{children}</DocumentSession>
  );
}

function DocumentSession({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [contents, setContents] = useState<ReadonlyMap<number, Document>>(
    new Map(),
  );
  const cache = useRef(new Map<number, Document>());
  const requests = useRef(new Map<number, Promise<Document>>());
  const listRequest = useRef<Promise<void> | null>(null);
  const loaded = useRef(false);
  const alive = useRef(true);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const sessions = useRef(new Map<number, DocumentSaveSession>());
  const [dirtyIds, setDirtyIds] = useState<ReadonlySet<number>>(new Set());
  const [savingIds, setSavingIds] = useState<ReadonlySet<number>>(new Set());
  const order = useRef<DocumentListItem[]>([]);
  const orderVersion = useRef(0);

  useEffect(() => {
    alive.current = true;
    const documentSessions = sessions.current;
    return () => {
      alive.current = false;
      for (const session of documentSessions.values()) session.dispose();
    };
  }, []);

  const enqueue = useCallback(<T,>(action: () => Promise<T>): Promise<T> => {
    const result = queue.current.then(action);
    queue.current = result.catch(() => undefined);
    return result;
  }, []);

  const loadDocuments = useCallback(async () => {
    if (loaded.current) return;
    if (!listRequest.current) {
      listRequest.current = fetchDocuments()
        .then((items) => {
          if (!alive.current) return;
          order.current = items;
          setDocuments(items);
          loaded.current = true;
        })
        .finally(() => {
          listRequest.current = null;
        });
    }
    return listRequest.current;
  }, []);

  const notifySaving = useCallback(() => {
    if (!alive.current) return;
    setDirtyIds(
      new Set(
        [...sessions.current]
          .filter(([, session]) => session.dirty)
          .map(([id]) => id),
      ),
    );
    setSavingIds(
      new Set(
        [...sessions.current]
          .filter(([, session]) => session.saving)
          .map(([id]) => id),
      ),
    );
  }, []);

  const loadDocument = useCallback(
    async (id: number) => {
      const existing = cache.current.get(id);
      if (existing) return existing;
      let request = requests.current.get(id);
      if (!request) {
        request = fetchDocument(id)
          .then((document) => {
            if (alive.current) {
              cache.current.set(id, document);
              sessions.current.set(
                id,
                new DocumentSaveSession(
                  document.text,
                  (text) =>
                    enqueue(async () => {
                      if (!alive.current || !sessions.current.has(id)) return;
                      await updateDocumentRequest(id, { text });
                    }),
                  notifySaving,
                  (message) => toast.error(message),
                ),
              );
              setContents(new Map(cache.current));
            }
            return document;
          })
          .finally(() => {
            requests.current.delete(id);
          });
        requests.current.set(id, request);
      }
      return request;
    },
    [enqueue, notifySaving],
  );

  async function addDocument(title: string) {
    try {
      return await enqueue(async () => {
        if (!alive.current) return false;
        await loadDocuments();
        if (!alive.current) return false;
        const id = await createDocumentRequest(title);
        if (alive.current) {
          const items = [...order.current, { id, title }];
          order.current = items;
          setDocuments(items);
        }
        return true;
      });
    } catch {
      toast.error('ドキュメントの追加に失敗しました。もう一度お試しください。');
      return false;
    }
  }

  function updateDocument(id: number, text: string) {
    const original = cache.current.get(id);
    if (!original) return;
    cache.current.set(id, { ...original, text });
    setContents(new Map(cache.current));
    sessions.current.get(id)?.update(text);
  }

  const saveDocument = useCallback(async (id: number) => {
    const session = sessions.current.get(id);
    return session ? session.flush() : true;
  }, []);

  const hasUnsavedDocument = useCallback(
    (id: number) => sessions.current.get(id)?.dirty ?? false,
    [],
  );

  async function deleteDocument(id: number) {
    try {
      return await enqueue(async () => {
        if (!alive.current) return false;
        await deleteDocumentRequest(id);
        sessions.current.get(id)?.dispose();
        sessions.current.delete(id);
        notifySaving();
        cache.current.delete(id);
        const items = order.current.filter((item) => item.id !== id);
        order.current = items;
        if (alive.current) {
          setDocuments(items);
          setContents(new Map(cache.current));
        }
        return true;
      });
    } catch {
      toast.error('ドキュメントの削除に失敗しました。もう一度お試しください。');
      return false;
    }
  }

  function reorderDocuments(ids: number[]) {
    const byId = new Map(order.current.map((item) => [item.id, item]));
    const items = ids.flatMap((id) => {
      const item = byId.get(id);
      return item ? [item] : [];
    });
    if (
      items.length !== order.current.length ||
      new Set(ids).size !== items.length
    )
      return;
    order.current = items;
    setDocuments(items);
    const version = ++orderVersion.current;
    void enqueue(async () => {
      if (!alive.current || version !== orderVersion.current) return;
      try {
        // Read the actual order so partial failures and concurrent mutations do not corrupt it.
        const current = await fetchDocuments();
        if (!alive.current) return;
        await persistDocumentOrder(
          current.map((item) => item.id),
          ids,
        );
      } catch {
        toast.error('並べ替えの保存に失敗しました。一覧を再取得します。');
        try {
          const current = await fetchDocuments();
          if (alive.current && version === orderVersion.current) {
            order.current = current;
            setDocuments(current);
          }
        } catch {
          toast.error(
            '一覧を再取得できませんでした。画面を再読み込みしてください。',
          );
        }
      }
    });
  }

  return (
    <DocumentArchiveContext.Provider
      value={{
        documents,
        contents,
        dirtyIds,
        savingIds,
        saveDocument,
        hasUnsavedDocument,
        loadDocuments,
        loadDocument,
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
