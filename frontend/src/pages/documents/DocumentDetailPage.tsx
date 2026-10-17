import { FileText, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { RichTextEditor } from '@/features/companies/ui/documents/RichTextEditor';
import { useDocumentArchive } from '@/features/documents/hooks/useDocumentArchive';
import { BackLink } from '@/shared/BackLink';
import { DeleteIconButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { DocumentApiError } from '@/features/documents/lib/documentApi';
import { SearchBox } from '@/shared/SearchBox';

export function DocumentDetailPage() {
  const { documentsId } = useParams();
  return <DocumentDetail key={documentsId} id={Number(documentsId)} />;
}

function DocumentDetail({ id }: { id: number }) {
  const navigate = useNavigate();
  const documentArchive = useDocumentArchive();
  const { loadDocument, saveDocument, hasUnsavedDocument } = documentArchive;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('読み込み中…');
  const deleting = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const document = documentArchive.contents.get(id);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      hasUnsavedDocument(id),
  );
  const navigationSave = useRef(false);

  useEffect(() => {
    if (blocker.state !== 'blocked' || navigationSave.current) return;
    navigationSave.current = true;
    void saveDocument(id).then((saved) => {
      navigationSave.current = false;
      if (saved) blocker.proceed();
      else blocker.reset();
    });
  }, [blocker, id, saveDocument]);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedDocument(id)) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [id, hasUnsavedDocument]);

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
      void Promise.resolve().then(() => {
        if (active) setMessage('指定されたドキュメントは見つかりませんでした');
      });
    } else {
      void loadDocument(id).catch((error) => {
        if (active)
          setMessage(
            error instanceof DocumentApiError && error.status === 404
              ? '指定されたドキュメントは見つかりませんでした'
              : 'ドキュメントを取得できませんでした。画面を再読み込みしてください。',
          );
      });
    }
    return () => {
      active = false;
    };
  }, [id, loadDocument]);

  if (!document) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/documents">ドキュメント一覧へ戻る</BackLink>
        <div className="ui-empty-state mt-5 border border-dashed border-[var(--line-strong)] py-16 text-center">
          <p className="text-sm font-bold text-[var(--muted)]">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4">
        <BackLink to="/documents">ドキュメント一覧へ戻る</BackLink>
      </div>

      <header className="ui-panel flex items-center gap-4 border border-[var(--line)] px-5 py-4">
        <div className="flex size-11 shrink-0 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--accent)]">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[var(--muted)]">
            DOCUMENT
          </p>
          <h1 className="mt-1 truncate text-xl font-black text-[var(--text-strong)]">
            {document.title}
          </h1>
        </div>
        <button
          type="button"
          aria-label="ドキュメントを保存"
          title={documentArchive.savingIds.has(id) ? '保存中…' : '保存する'}
          disabled={
            isDeleting ||
            blocker.state === 'blocked' ||
            documentArchive.savingIds.has(id) ||
            !documentArchive.dirtyIds.has(id)
          }
          onClick={() => {
            void saveDocument(id);
          }}
          className="flex size-10 items-center justify-center border border-[var(--line)] bg-[var(--panel-raised)] text-[var(--accent)] transition-colors hover:border-[var(--accent)] disabled:cursor-default disabled:opacity-40"
        >
          <Save className="size-4" />
        </button>
        <DeleteIconButton
          size="m"
          transparent={false}
          ariaLabel={`${document.title}を削除`}
          onClick={() => setIsDeleteDialogOpen(true)}
        />
      </header>

      <div className="ui-panel mt-4 border border-[var(--line)] p-4">
        <SearchBox
          value={query}
          onValueChange={setQuery}
          placeholder="本文を検索"
          aria-label="ドキュメント本文を検索"
        />
      </div>

      <div className="mt-4">
        <RichTextEditor
          value={document.text}
          disabled={isDeleting || blocker.state === 'blocked'}
          onChange={(text) => documentArchive.updateDocument(id, text)}
          placeholder="自由にメモを入力してください"
          minHeight={560}
          className="workspace-document-editor"
          staticAppearance
          searchQuery={query}
        />
      </div>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="ドキュメントを削除しますか？"
          text={`「${document.title}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (deleting.current) return;
            deleting.current = true;
            setIsDeleting(true);
            if (await documentArchive.deleteDocument(id))
              navigate('/documents');
            else {
              deleting.current = false;
              setIsDeleting(false);
            }
          }}
        />
      )}
    </div>
  );
}
