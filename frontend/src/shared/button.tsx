import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { DeleteDialog } from "@/shared/dialog";

type Size = "s" | "m" | "l";

type TextProps = {
  text: string;
  size?: Size;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

type IconProps = {
  icon: ReactElement;
  style: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

type BulkDeleteProps = {
  size: Size;
  count: number;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function TransparentTextButton({ text, onClick }: TextProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        h-10 border border-[var(--line)] px-5
        text-xs font-semibold text-[var(--muted)]
        transition-colors hover:border-[var(--muted)]
      "
    >
      {text}
    </button>
  );
}

function TransparentIconButton({ icon, style, onClick }: IconProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex size-8 items-center justify-center
        border border-[var(--line)] text-[var(--muted)]
        ${style}
      `}
    >
      {icon}
    </button>
  );
}


export function EditIconButton({ onClick }: { onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <TransparentIconButton
      icon={<Pencil className="size-3.5" />}
      style="hover:border-[var(--accent)] hover:text-[var(--accent)]"
      onClick={onClick}
    />
  );
}

export function DeleteTextButton({ onClick }: { onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        h-10 bg-rose-500 px-5 text-xs font-bold text-white
        border border-rose-500
        transition-colors hover:bg-[var(--accent-soft)] hover:text-rose-500
      "
    >
      削除する
    </button>
  );
}

export function DeleteIconButton({ onClick }: { onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <TransparentIconButton
      icon={<Trash2 className="size-3.5" />}
      style="hover:border-rose-500 hover:text-rose-500"
      onClick={onClick}
    />
  );
}

export function BulkDeleteButton({ size, count, onClick }: BulkDeleteProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  var buttonStyle: string;
  var iconStyle: string;

  if (size === "s") {
    buttonStyle = "h-7 gap-1 text-[9px] px-2";
    iconStyle = "size-3";
  } else {
    buttonStyle = "h-10 gap-2 text-xs px-4";
    iconStyle = "size-3.5";
  }
  
  return (
    <>
      <button
        type="button"
        disabled={count === 0}
        onClick={() => setIsDeleteDialogOpen(true)}
        className={`
          flex items-center border border-[var(--line)]
          font-semibold text-[var(--muted)] transition-colors
          hover:border-rose-500 hover:text-rose-500 disabled:opacity-40
          ${buttonStyle}
        `}
      >
        <Trash2 className={iconStyle} />
        完了済みを削除 ({count})
      </button>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="完了済みのタスクを削除しますか？"
          text={`完了済みのタスク${count}件を一括削除します。この操作は取り消せません。`}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onDelete={(event) => {
            onClick(event);
            setIsDeleteDialogOpen(false);
          }}
          onBackdropClick={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
}

export function CancelButton({ onClick }: { onClick: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        h-10 border border-[var(--line)] px-5
        text-xs font-semibold text-[var(--muted)]
        transition-colors hover:border-[var(--muted)]
      "
    >
      キャンセル
    </button>
  );
}

export function ColoredAddButton({text, size, onClick}: TextProps) {
  var buttonStyle: string;
  var iconStyle: string;

  if (size === "s") {
    buttonStyle = "h-8 gap-1.5 px-3 text-[9px]";
    iconStyle = "size-3";
  } else {
    buttonStyle = "h-9 gap-2 px-4 text-xs";
    iconStyle = "size-3.5";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        cyber-cut-sm flex items-center font-bold
        border border-[var(--accent)]
        bg-[var(--accent)] text-[var(--accent-contrast)]
        transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]
        ${buttonStyle}
      `}
    >
      <Plus className={iconStyle} />
      {text}
    </button>
  );
}

export function TransParentAddButton({ text, onClick }: TextProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex h-8 items-center gap-1.5
        border border-[var(--line)] px-3
        text-[9px] font-bold text-[var(--accent)]
        transition-colors hover:border-[var(--accent)]
      "
    >
      <Plus className="size-3" />
      {text}
    </button>
  );
}

export function ColoredSubmitButton({ text }: { text: string }) {
  return (
    <button
      type="submit"
      className="
        cyber-cut-sm h-10 bg-[var(--accent)]
        border border-[var(--accent)]
        px-5 text-xs font-bold text-[var(--accent-contrast)]
        transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]
      "
    >
      {text}
    </button>
  );
}
