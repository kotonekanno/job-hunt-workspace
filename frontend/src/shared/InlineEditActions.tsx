import { Check, X } from 'lucide-react';

type InlineEditActionsProps = {
  saveLabel: string;
  cancelLabel: string;
  disabled?: boolean;
  onSave?: () => void;
  onCancel: () => void;
};

export function InlineEditActions({
  saveLabel,
  cancelLabel,
  disabled,
  onSave,
  onCancel,
}: InlineEditActionsProps) {
  return (
    <>
      <button
        type={onSave ? 'button' : 'submit'}
        onClick={onSave}
        disabled={disabled}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={saveLabel}
        title="保存"
      >
        <Check aria-hidden="true" className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
        aria-label={cancelLabel}
        title="キャンセル"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </>
  );
}
