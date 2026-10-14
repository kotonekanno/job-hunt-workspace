import { useState, type FormEvent } from 'react';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

type DocumentCreateDialogProps = {
  onClose: () => void;
  onCreate: (title: string) => void | Promise<void>;
  dialogTitle?: string;
  subTitle?: string;
  placeholder?: string;
};

export function DocumentCreateDialog({
  onClose,
  onCreate,
  dialogTitle = '書類を追加',
  subTitle = '// DOCUMENT_CREATE',
  placeholder = '例：一次面接対策',
}: DocumentCreateDialogProps) {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await onCreate(normalizedTitle);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '追加できませんでした。',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EditDialog
      title={dialogTitle}
      subTitle={subTitle}
      submitText={isSaving ? '追加中…' : '追加する'}
      onClose={onClose}
      onSubmit={submit}
    >
      <>
        {error && (
          <p role="alert" className="text-sm text-rose-500">
            {error}
          </p>
        )}
        <label className="block text-xs text-[var(--muted)]">
          タイトル
          <RequiredMark />
          <input
            autoFocus
            required
            maxLength={50}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
            placeholder={placeholder}
          />
        </label>
      </>
    </EditDialog>
  );
}
