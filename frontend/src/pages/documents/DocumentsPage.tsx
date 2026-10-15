import { RequestStatus } from '@/shared/RequestStatus';
import { NotebookTabs } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDocumentArchive } from '@/features/documents/hooks/useDocumentArchive';
import type { DocumentListItem } from '@/api/generated/models';
import { DocumentList } from '@/features/documents/ui/DocumentList';
import { DocumentCreateDialog } from '@/features/companies/ui/detail/DocumentCreateDialog';
import { FloatingAddButton } from '@/shared/button';
import { InnerHeader } from '@/shared/header';
import { SearchBox } from '@/shared/SearchBox';

export function DocumentsPage() {
  const documentArchive = useDocumentArchive();
  const [query, setQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return documentArchive.documents;
    }

    return documentArchive.documents.filter((document) =>
      `${document.title}\n${documentArchive.contents[document.id]?.text ?? ''}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [documentArchive.documents, documentArchive.contents, query]);

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
      return nextDocument.id;
    });

    return documentArchive.reorderDocuments(orderedIds);
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

      <RequestStatus
        isLoading={documentArchive.isLoading}
        error={documentArchive.error}
      />
      <div className="mt-5">
        <DocumentList
          documents={filteredDocuments}
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
