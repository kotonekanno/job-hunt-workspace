import { useState } from 'react';
import type {
  SelectionStepResponse,
  SelectionStepRequest,
} from '@/api/generated/models';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

export function SelectionStepDialog({
  step,
  onSave,
  onClose,
}: {
  step?: SelectionStepResponse;
  onSave: (request: SelectionStepRequest) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(step?.name ?? '');
  const [note, setNote] = useState(step?.note ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const style =
    'mt-1 w-full border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';
  return (
    <EditDialog
      title={step ? '選考ステップを編集' : '選考ステップを追加'}
      submitText={isSaving ? '保存中…' : '保存する'}
      onClose={onClose}
      onSubmit={async (event) => {
        event.preventDefault();
        if (isSaving || !name.trim()) return;
        setIsSaving(true);
        setError('');
        try {
          await onSave({ name: name.trim(), note });
          onClose();
        } catch {
          setError('ステップを保存できませんでした。');
        } finally {
          setIsSaving(false);
        }
      }}
    >
      <>
        {error && (
          <p role="alert" className="text-sm text-rose-500">
            {error}
          </p>
        )}
        <label className="block text-xs text-[var(--muted)]">
          ステップ名
          <RequiredMark />
          <input
            required
            maxLength={50}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={style}
          />
        </label>
        <label className="block text-xs text-[var(--muted)]">
          メモ
          <textarea
            maxLength={2000}
            value={note}
            rows={4}
            onChange={(event) => setNote(event.target.value)}
            className={style}
          />
        </label>
      </>
    </EditDialog>
  );
}
