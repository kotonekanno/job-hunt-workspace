import { NotebookTabs } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDocumentArchive } from '@/features/documents/hooks/useDocumentArchive';
import type { DocumentListItem } from '@/api/generated/models/documentListItem';
import { toast } from '@/shared/toast';
import { DocumentList } from '@/features/documents/ui/DocumentList';
import { DocumentCreateDialog } from '@/features/companies/ui/detail/DocumentCreateDialog';
import { FloatingAddButton } from '@/shared/button';
import { InnerHeader } from '@/shared/header';
import { SearchBox } from '@/shared/SearchBox';

export function DocumentsPage() {
  const documentArchive = useDocumentArchive();
  const [query, setQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searching, setSearching] = useState(false);
  const { loadDocuments, loadDocument, documents, contents } = documentArchive;

  useEffect(() => {
    let active = true;
    void loadDocuments()
      .catch(() => {
        if (active) {
          setLoadError(true);
          toast.error(
            '一覧を取得できませんでした。画面を再読み込みしてください。',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadDocuments]);

  useEffect(() => {
    if (!query.trim()) return;
    let active = true;
    // Fetch full text only when searching; the list response contains IDs and titles only.
    void (async () => {
      setSearching(true);
      const results = await Promise.allSettled(
        documents.map((item) => loadDocument(item.id)),
      );
      if (!active) return;
      setSearching(false);
      if (results.some((result) => result.status === 'rejected')) {
        toast.error(
          '一部の本文を取得できず、検索結果に含められませんでした。検索し直すと再試行します。',
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [query, documents, loadDocument]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) return documents;
    return documents.filter((document) =>
      `${document.title}\n${contents.get(document.id)?.text ?? ''}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [documents, contents, query]);

  function reorderFilteredDocuments(orderedDocuments: DocumentListItem[]) {
    const visibleIds = new Set(
      filteredDocuments.map((document) => document.id),
    );
    let visibleIndex = 0;
    const orderedIds = documentArchive.documents.map((document) => {
      if (!visibleIds.has(document.id)) {
        return document.id;
      }

      const nextDocument = orderedDocuments[visibleIndex];
      visibleIndex += 1;
      return nextDocument?.id ?? document.id;
    });

    documentArchive.reorderDocuments(orderedIds);
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <InnerHeader
        title="ドキュメント"
        subTitle="DOCUMENTS"
        icon={<NotebookTabs className="size-5 text-[var(--accent)]" />}
      />

      <div className="ui-panel cyber-cut border border-[var(--line)] p-4">
        <SearchBox
          value={query}
          onValueChange={setQuery}
          placeholder="タイトル・本文を検索"
          aria-label="ドキュメントを検索"
        />
      </div>

      <div className="mt-5">
        <DocumentList
          documents={filteredDocuments}
          emptyMessage={
            loading
              ? '読み込み中…'
              : loadError
                ? '一覧を取得できませんでした'
                : query.trim() && searching
                  ? '本文を検索中…'
                  : undefined
          }
          onDelete={documentArchive.deleteDocument}
          onReorder={reorderFilteredDocuments}
        />
      </div>

      <FloatingAddButton
        text="ドキュメントを追加"
        onClick={() => setIsCreateDialogOpen(true)}
      />

      {isCreateDialogOpen && (
        <DocumentCreateDialog
          dialogTitle="ドキュメントを追加"
          subTitle="DOCUMENT CREATE"
          placeholder="例：就活プラン"
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={documentArchive.addDocument}
        />
      )}
    </div>
  );
}
