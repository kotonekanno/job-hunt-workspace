import { Trash2, X } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type DialogBaseProps = {
  children: ReactNode;
  onClose: () => void;
  suspended?: boolean;
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
  confirmType?: 'button' | 'submit';
  onConfirm?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type DeleteDialogProps = {
  title: string;
  text: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

type EditDialogProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  subTitle?: string;
  submitText?: string;
  formClassName?: string;
  fieldsClassName?: string;
  titleClassName?: string;
};

export function DialogBase({
  children,
  onClose,
  suspended = false,
}: DialogBaseProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (suspended) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, suspended]);

  return createPortal(
    <div
      inert={suspended}
      aria-hidden={suspended || undefined}
      className="fixed inset-0 z-[10000] flex animate-in items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm fade-in duration-150"
      onMouseDown={(event) => {
        if (!suspended && event.target === event.currentTarget) onClose();
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
  titleClassName = 'text-base',
}: DialogHeaderProps) {
  return (
    <div className="relative flex items-start justify-between border-b border-[var(--line)] pb-4">
      <span className="absolute -bottom-px left-0 h-px w-14 bg-[var(--accent)]" />
      <div>
        {subTitle && (
          <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">
            {subTitle}
          </p>
        )}
        <h2
          id={titleId}
          className={`${subTitle ? 'mt-1' : ''} font-bold text-[var(--text-strong)] ${titleClassName}`}
        >
          {title}
        </h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="ui-control flex size-8 cursor-pointer items-center justify-center text-[var(--muted)] hover:bg-[var(--panel-raised)] hover:text-[var(--text-strong)]"
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
  confirmType = 'button',
  onConfirm,
  destructive = false,
  disabled = false,
}: DialogActionsProps) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="ui-control h-10 cursor-pointer border border-[var(--line)] bg-[var(--panel-raised)] px-5 text-xs font-semibold text-[var(--muted)] hover:border-[var(--muted)]"
      >
        キャンセル
      </button>
      <button
        disabled={disabled}
        type={confirmType}
        onClick={onConfirm}
        className={
          destructive
            ? 'ui-control h-10 cursor-pointer border border-rose-500 bg-rose-500 px-5 text-xs font-bold text-white hover:bg-[var(--accent-soft)] hover:text-rose-500'
            : 'ui-control cyber-cut-sm h-10 cursor-pointer border border-[var(--accent)] bg-[var(--accent)] px-5 text-xs font-bold text-[var(--accent-contrast)] shadow-[0_4px_14px_var(--accent-glow)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]'
        }
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
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  return (
    <DialogBase onClose={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ui-dialog-surface cyber-cut w-full max-w-md animate-in border border-[var(--line-strong)] p-6 zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-2 pb-2">
          <Trash2 className="size-5 text-rose-500" />
          <h2
            id={titleId}
            className="text-base font-bold text-[var(--text-strong)]"
          >
            {title}
          </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-500">
            {error}
          </p>
        )}
        <DialogActions
          onClose={onClose}
          disabled={saving}
          onConfirm={() => {
            if (busy.current) return;
            busy.current = true;
            setSaving(true);
            setError('');
            void Promise.resolve()
              .then(onConfirm)
              .catch((cause) =>
                setError(
                  cause instanceof Error
                    ? cause.message
                    : '削除できませんでした。',
                ),
              )
              .finally(() => {
                busy.current = false;
                setSaving(false);
              });
          }}
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
  submitText = '追加する',
  formClassName = 'max-w-md p-6',
  fieldsClassName = 'mt-5 space-y-4',
  titleClassName = 'text-base',
}: EditDialogProps) {
  const titleId = useId();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  return (
    <DialogBase onClose={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy.current) return;
          busy.current = true;
          setSaving(true);
          setError('');
          try {
            // Call synchronously so handlers may still read event.currentTarget.
            await onSubmit(event);
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : '保存できませんでした。',
            );
          } finally {
            busy.current = false;
            setSaving(false);
          }
        }}
        className={`ui-dialog-surface cyber-cut w-full animate-in border border-[var(--line-strong)] zoom-in-95 duration-150 ${formClassName}`}
      >
        <DialogHeader
          title={title}
          titleId={titleId}
          onClose={onClose}
          subTitle={subTitle}
          titleClassName={titleClassName}
        />
        <fieldset disabled={saving} className={fieldsClassName}>
          {children}
        </fieldset>
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-500">
            {error}
          </p>
        )}
        <DialogActions
          onClose={onClose}
          confirmText={submitText}
          confirmType="submit"
          disabled={saving}
        />
      </form>
    </DialogBase>
  );
}
