import { Trash2, X } from "lucide-react";
import type {
  FormEventHandler,
  MouseEventHandler,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

type DialogBaseProps = {
  children: ReactNode;
  onBackdropClick: () => void;
};

type DeleteDialogProps = {
  title: string;
  text: string;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  onDelete: MouseEventHandler<HTMLButtonElement>;
  onBackdropClick: () => void;
};

type EditDialogProps = {
  title: string;
  fields: ReactNode;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onBackdropClick?: () => void;
  subTitle?: string;
  submitText?: string;
  formClassName?: string;
  fieldsClassName?: string;
  titleClassName?: string;
};

export function DialogBase({
  children,
  onBackdropClick,
}: DialogBaseProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm"
      onMouseDown={onBackdropClick}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DeleteDialog({
  title,
  text,
  onCancel,
  onDelete,
  onBackdropClick,
}: DeleteDialogProps) {
  return (
    <DialogBase onBackdropClick={onBackdropClick}>
      <div
        className="cyber-cut w-full max-w-md border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)]"
        onMouseDown={(event) => event.stopPropagation()}
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
    </DialogBase>
  );
}

export function EditDialog({
  title,
  fields,
  onClose,
  onSubmit,
  onBackdropClick = onClose,
  subTitle,
  submitText = "追加する",
  formClassName = "max-w-md p-6",
  fieldsClassName = "mt-5 space-y-4",
  titleClassName = "text-base",
}: EditDialogProps) {
  return (
    <DialogBase onBackdropClick={onBackdropClick}>
      <form
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className={`cyber-cut w-full border border-[var(--line-strong)] bg-[var(--panel)] shadow-[0_20px_60px_var(--shadow)] ${formClassName}`}
      >
        <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
          <div>
            {subTitle && (
              <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">
                {subTitle}
              </p>
            )}
            <h2 className={`${subTitle ? "mt-1" : ""} font-bold text-[var(--text-strong)] ${titleClassName}`}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center text-[var(--muted)] hover:text-[var(--text-strong)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className={fieldsClassName}>
          {fields}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 border border-[var(--line)] px-5 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--muted)]"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="cyber-cut-sm h-10 border border-[var(--accent)] bg-[var(--accent)] px-5 text-xs font-bold text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          >
            {submitText}
          </button>
        </div>
      </form>
    </DialogBase>
  );
}
