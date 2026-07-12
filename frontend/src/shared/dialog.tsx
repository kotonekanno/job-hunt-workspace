import { Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

type DeleteProps = {
  title: string;
  text: string;
  onCancel: React.MouseEventHandler<HTMLButtonElement>;
  onDelete: React.MouseEventHandler<HTMLButtonElement>;
  onBackdropClick: () => void;
}

export function DeleteDialog({
  title,
  text,
  onCancel,
  onDelete,
  onBackdropClick,
}: DeleteProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm"
      onMouseDown={onBackdropClick}
    >
      <div
        className="
          cyber-cut w-full max-w-md
          border border-[var(--line-strong)] bg-[var(--panel)]
          p-6 shadow-[0_20px_60px_var(--shadow)]
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 pb-2">
          <Trash2 className="size-5 text-rose-500" />
          <h2 className="text-base font-bold text-[var(--text-strong)]">
            {title}
          </h2>
        </div>

        <p className="mt-2 text-sm text-[var(--muted)]">
          {text}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 border border-[var(--line)] px-5 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--muted)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="h-10 border border-rose-500 bg-rose-500 px-5 text-xs font-bold text-white transition-colors hover:bg-[var(--accent-soft)] hover:text-rose-500"
          >
            削除する
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
