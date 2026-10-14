import { NotebookTabs } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useDocumentArchive } from '@/features/documents/hooks/useDocumentArchive';
import type { DocumentListItem } from '@/api/generated/models';
import { DocumentList } from '@/features/documents/ui/DocumentList';
import { DocumentCreateDialog } from '@/features/companies/ui/detail/DocumentCreateDialog';
import { FloatingAddButton } from '@/shared/button';
import { InnerHeader } from '@/shared/header';
import { SearchBox } from '@/shared/SearchBox';

export function DocumentsPage() {
  const documentArchive = useDocumentArchive();
  const [draft, setDraft] = useState<DocumentListItem[]>();
  const draftRef = useRef<DocumentListItem[] | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    const ordered = draft ?? documentArchive.documents;
    return ordered.filter(
      (document) =>
        !normalizedQuery ||
        document.title.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [documentArchive.documents, draft, query]);

  function reorderFilteredDocuments(orderedDocuments: DocumentListItem[]) {
    const visibleIds = new Set(
      filteredDocuments.map((document) => document.id),
    );
    let index = 0;
    const next = (draft ?? documentArchive.documents).map((document) =>
      visibleIds.has(document.id)
        ? (orderedDocuments[index++] ?? document)
        : document,
    );
    draftRef.current = next;
    setDraft(next);
  }
  async function commitOrder() {
    const next = draftRef.current;
    draftRef.current = undefined;
    if (!next) return;
    try {
      await documentArchive.reorderDocuments(
        next.map((document) => document.id),
      );
    } catch {
      /* The provider exposes the failure. */
    } finally {
      setDraft(undefined);
    }
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
          placeholder="タイトルを検索"
          aria-label="ドキュメントを検索"
        />
      </div>

      {documentArchive.error && (
        <p role="alert" className="mt-3 text-sm text-rose-500">
          {documentArchive.error}
        </p>
      )}
      {documentArchive.isLoading && (
        <p role="status" className="mt-3 text-sm text-[var(--muted)]">
          ドキュメントを読み込み中…
        </p>
      )}
      <div className="mt-5">
        <DocumentList
          documents={filteredDocuments}
          onDelete={documentArchive.deleteDocument}
          onReorder={reorderFilteredDocuments}
          onReorderCommit={() => {
            void commitOrder();
          }}
        />
      </div>

      <FloatingAddButton
        text="ドキュメントを追加"
        onClick={() => {
          if (!documentArchive.isLoading && !documentArchive.error)
            setIsCreateDialogOpen(true);
        }}
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
