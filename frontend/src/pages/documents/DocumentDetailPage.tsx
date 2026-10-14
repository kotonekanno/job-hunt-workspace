import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Document, UpdateDocumentRequest } from '@/api/generated/models';
import { RichTextEditor } from '@/features/companies/ui/documents/RichTextEditor';
import { useDocumentArchive } from '@/features/documents/hooks/useDocumentArchive';
import { BackLink } from '@/shared/BackLink';
import { DeleteIconButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { SearchBox } from '@/shared/SearchBox';

export function DocumentDetailPage() {
  const { documentId } = useParams();
  return (
    <DocumentDetailContent key={documentId} documentId={Number(documentId)} />
  );
}
function DocumentDetailContent({ documentId }: { documentId: number }) {
  const navigate = useNavigate();
  const archive = useDocumentArchive();
  const loadDocument = archive.loadDocument;
  const [saved, setSaved] = useState<Document>();
  const [draft, setDraft] = useState<Document>();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const document = await loadDocument(documentId, controller.signal);
        if (!controller.signal.aborted) {
          setSaved(document);
          setDraft(document);
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error ? cause.message : '取得できませんでした。',
          );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [documentId, loadDocument]);
  async function save() {
    if (!draft || !saved || isSaving) return;
    const snapshot = { title: draft.title.trim(), text: draft.text };
    if (
      !snapshot.title ||
      snapshot.title.length > 50 ||
      snapshot.text.length > 50000
    ) {
      setError('タイトルは1〜50文字、本文は50000文字以内で入力してください。');
      return;
    }
    const patch: UpdateDocumentRequest = {};
    if (saved.title !== snapshot.title) patch.title = snapshot.title;
    if (saved.text !== snapshot.text) patch.text = snapshot.text;
    setIsSaving(true);
    setError('');
    try {
      await archive.updateDocument(documentId, patch);
      setSaved(snapshot);
      setDraft((current) =>
        current && current.title.trim() === snapshot.title
          ? { ...current, title: snapshot.title }
          : current,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '保存できませんでした。',
      );
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4">
        <BackLink to="/documents">ドキュメント一覧へ戻る</BackLink>
      </div>
      {error && (
        <p role="alert" className="my-3 text-sm text-rose-500">
          {error}
        </p>
      )}
      {isLoading && (
        <p role="status" className="text-sm text-[var(--muted)]">
          ドキュメントを読み込み中…
        </p>
      )}
      {draft && (
        <>
          <header className="ui-panel flex items-center gap-4 border border-[var(--line)] px-5 py-4">
            <div className="flex size-11 shrink-0 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--accent)]">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[var(--muted)]">
                DOCUMENT
              </p>
              <input
                aria-label="ドキュメントのタイトル"
                required
                maxLength={50}
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
                className="mt-1 w-full border-0 bg-transparent text-xl font-black text-[var(--text-strong)] outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <button
              type="button"
              disabled={
                isSaving ||
                !draft.title.trim() ||
                (draft.title === saved?.title && draft.text === saved?.text)
              }
              onClick={() => {
                void save();
              }}
              className="cursor-pointer border border-[var(--accent)] px-4 py-2 text-xs font-bold text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? '保存中…' : '保存する'}
            </button>
            <DeleteIconButton
              size="m"
              transparent={false}
              ariaLabel={`${draft.title}を削除`}
              onClick={() => setIsDeleteOpen(true)}
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
              value={draft.text}
              onChange={(text) =>
                setDraft((current) => current && { ...current, text })
              }
              placeholder="自由にメモを入力してください"
              minHeight={560}
              className="workspace-document-editor"
              staticAppearance
              searchQuery={query}
            />
          </div>
          {isDeleteOpen && (
            <DeleteDialog
              title="ドキュメントを削除しますか？"
              text={`「${draft.title}」を削除します。この操作は取り消せません。`}
              onClose={() => setIsDeleteOpen(false)}
              onConfirm={async () => {
                await archive.deleteDocument(documentId);
                navigate('/documents');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
