import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type {
  CreateSelectionRequest,
  SelectionStepRequest,
} from '@/api/generated/models';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

export function SelectionTrackDialog({
  onSave,
  onClose,
}: {
  onSave: (request: CreateSelectionRequest) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState<
    Array<SelectionStepRequest & { key: string }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const inputStyle =
    'mt-1 w-full border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';
  return (
    <EditDialog
      title="選考を追加"
      submitText={isSaving ? '保存中…' : '保存する'}
      formClassName="max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      onClose={onClose}
      onSubmit={async (event) => {
        event.preventDefault();
        if (isSaving || !title.trim()) return;
        setIsSaving(true);
        setError('');
        try {
          await onSave({
            title: title.trim(),
            steps: steps.map((step) => ({
              name: step.name.trim(),
              note: step.note,
            })),
          });
          onClose();
        } catch {
          setError('選考を追加できませんでした。');
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
          選考の種類
          <RequiredMark />
          <input
            required
            maxLength={50}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例：本選考"
            className={inputStyle}
          />
        </label>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="border border-[var(--line)] bg-[var(--panel-raised)] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-[var(--accent)]">
                  STEP {index + 1}
                </p>
                <button
                  type="button"
                  aria-label={`ステップ${index + 1}を削除`}
                  className="cursor-pointer text-[var(--muted)] hover:text-rose-500"
                  onClick={() =>
                    setSteps((current) =>
                      current.filter((item) => item.key !== step.key),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <label className="block text-xs text-[var(--muted)]">
                ステップ名
                <RequiredMark />
                <input
                  required
                  maxLength={50}
                  value={step.name}
                  onChange={(event) =>
                    setSteps((current) =>
                      current.map((item) =>
                        item.key === step.key
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className={inputStyle}
                />
              </label>
              <label className="mt-3 block text-xs text-[var(--muted)]">
                メモ
                <textarea
                  maxLength={2000}
                  value={step.note ?? ''}
                  rows={3}
                  onChange={(event) =>
                    setSteps((current) =>
                      current.map((item) =>
                        item.key === step.key
                          ? { ...item, note: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className={inputStyle}
                />
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setSteps((current) => [
              ...current,
              { key: crypto.randomUUID(), name: '', note: '' },
            ])
          }
          className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 border border-dashed border-[var(--line-strong)] text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          <Plus className="size-3.5" />
          選考ステップを追加
        </button>
      </>
    </EditDialog>
  );
}
