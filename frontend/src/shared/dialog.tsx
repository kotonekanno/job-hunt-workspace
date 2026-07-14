import { Trash2, X } from "lucide-react";
import {
  useEffect,
  useId,
  type FormEventHandler,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type DialogBaseProps = {
  children: ReactNode;
  onClose: () => void;
};

type DialogHeaderProps = {
  title: string;
  titleId: string;
  onClose: () => void;
  subTitle?: string;
  titleClassName?: string;
};

type DialogActionsProps = {
  onClose: () => void;
  confirmText: string;
  confirmType?: "button" | "submit";
  onConfirm?: () => void;
  destructive?: boolean;
};

type HoverDialogBaseProps = {
  children: ReactNode;
  isSelected: boolean;
  onClick: () => void;
};

type DeleteDialogProps = {
  title: string;
  text: string;
  onClose: () => void;
  onConfirm: () => void;
};

type EditDialogProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  subTitle?: string;
  submitText?: string;
  formClassName?: string;
  fieldsClassName?: string;
  titleClassName?: string;
};

export function DialogBase({
  children,
  onClose,
}: DialogBaseProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DialogHeader({
  title,
  titleId,
  onClose,
  subTitle,
  titleClassName = "text-base",
}: DialogHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
      <div>
        {subTitle && (
          <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">
            {subTitle}
          </p>
        )}
        <h2
          id={titleId}
          className={`${subTitle ? "mt-1" : ""} font-bold text-[var(--text-strong)] ${titleClassName}`}
        >
          {title}
        </h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex size-8 cursor-pointer items-center justify-center text-[var(--muted)] hover:text-[var(--text-strong)]"
        aria-label="ダイアログを閉じる"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function DialogActions({
  onClose,
  confirmText,
  confirmType = "button",
  onConfirm,
  destructive = false,
}: DialogActionsProps) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="h-10 cursor-pointer border border-[var(--line)] px-5 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[var(--muted)]"
      >
        キャンセル
      </button>
      <button
        type={confirmType}
        onClick={onConfirm}
        className={destructive
          ? "h-10 cursor-pointer border border-rose-500 bg-rose-500 px-5 text-xs font-bold text-white transition-colors hover:bg-[var(--accent-soft)] hover:text-rose-500"
          : "cyber-cut-sm h-10 cursor-pointer border border-[var(--accent)] bg-[var(--accent)] px-5 text-xs font-bold text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"}
      >
        {confirmText}
      </button>
    </div>
  );
}

export function DeleteDialog({
  title,
  text,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  const titleId = useId();

  return (
    <DialogBase onClose={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="cyber-cut w-full max-w-md border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)]"
      >
        <div className="flex items-center gap-2 pb-2">
          <Trash2 className="size-5 text-rose-500" />
          <h2 id={titleId} className="text-base font-bold text-[var(--text-strong)]">
            {title}
          </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
        <DialogActions
          onClose={onClose}
          onConfirm={onConfirm}
          confirmText="削除する"
          destructive
        />
      </div>
    </DialogBase>
  );
}

export function EditDialog({
  title,
  children,
  onClose,
  onSubmit,
  subTitle,
  submitText = "追加する",
  formClassName = "max-w-md p-6",
  fieldsClassName = "mt-5 space-y-4",
  titleClassName = "text-base",
}: EditDialogProps) {
  const titleId = useId();

  return (
    <DialogBase onClose={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={onSubmit}
        className={`cyber-cut w-full border border-[var(--line-strong)] bg-[var(--panel)] shadow-[0_20px_60px_var(--shadow)] ${formClassName}`}
      >
        <DialogHeader
          title={title}
          titleId={titleId}
          onClose={onClose}
          subTitle={subTitle}
          titleClassName={titleClassName}
        />
        <div className={fieldsClassName}>{children}</div>
        <DialogActions
          onClose={onClose}
          confirmText={submitText}
          confirmType="submit"
        />
      </form>
    </DialogBase>
  );
}
