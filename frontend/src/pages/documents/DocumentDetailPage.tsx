import { FileText } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RichTextEditor } from '@/features/companies/ui/documents/RichTextEditor';
import { useDocumentArchive } from '@/features/documents/hooks/useDocumentArchive';
import { BackLink } from '@/shared/BackLink';
import { DeleteIconButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { RequestStatus } from '@/shared/RequestStatus';
import { SearchBox } from '@/shared/SearchBox';

export function DocumentDetailPage() {
  const { documentsId } = useParams();
  return <DocumentDetailContent key={documentsId} />;
}
function DocumentDetailContent() {
  const navigate = useNavigate();
  const { documentsId } = useParams();
  const documentArchive = useDocumentArchive();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const documentId = Number(documentsId);
  const document = documentArchive.contents[documentId];

  if (!document) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/documents">ドキュメント一覧へ戻る</BackLink>
        <div className="ui-empty-state mt-5 border border-dashed border-[var(--line-strong)] py-16 text-center">
          <p className="text-sm font-bold text-[var(--muted)]">
            {documentArchive.isLoading
              ? '読み込み中…'
              : documentArchive.error ||
                '指定されたドキュメントは見つかりませんでした'}
          </p>
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

      <RequestStatus error={error || documentArchive.error} />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={saving || draft === undefined || draft === document.text}
          className="cursor-pointer border border-[var(--accent)] px-3 py-1.5 text-xs text-[var(--accent)] disabled:opacity-40"
          onClick={async () => {
            if (draft === undefined) return;
            setSaving(true);
            setError('');
            try {
              if (draft.length > 50000)
                throw new Error('本文は50,000文字以内で入力してください。');
              await documentArchive.updateDocument(documentId, { text: draft });
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : '文書を保存できませんでした。',
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? '保存中…' : '保存する'}
        </button>
      </div>
      <div className="mt-4">
        <RichTextEditor
          value={draft ?? document.text}
          onChange={setDraft}
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
            await documentArchive.deleteDocument(documentId);
            navigate('/documents');
          }}
        />
      )}
    </div>
  );
}
