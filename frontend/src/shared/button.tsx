import {
  Pencil,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { DeleteDialog } from "@/shared/dialog";
import type { Size } from "@/shared/shared-type";

type ButtonVariant = "primary" | "secondary" | "danger-ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

type AddButtonProps = {
  text: string;
  size: Size;
  onClick: () => void;
};

type IconActionButtonBaseProps = {
  size: Size;
  transparent: boolean;
  onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  ariaLabel?: string;
};

type IconActionButtonProps = IconActionButtonBaseProps & {
  icon: LucideIcon;
  danger?: boolean;
  tooltip?: string;
  className?: string;
  iconClassName?: string;
};

type BulkDeleteButtonProps = {
  size: Size;
  count: number;
  onConfirm: () => void;
  itemLabel?: string;
};

type FloatingIconButtonProps = {
  icon: LucideIcon;
  onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  ariaLabel: string;
  title?: string;
  tooltip?: string;
  className?: string;
};

type FloatingAddButtonProps = {
  text: string;
  onClick: () => void;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "cyber-cut-sm border-[var(--accent)] bg-[var(--accent)] font-bold text-[var(--accent-contrast)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  secondary: "border-[var(--line)] font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
  "danger-ghost": "border-[var(--line)] font-semibold text-[var(--muted)] hover:border-rose-500 hover:text-rose-500",
};

const sizeStyles = {
  s: {
    button: "h-8 gap-1.5 px-3 text-[9px]",
    icon: "size-3",
  },
  m: {
    button: "h-9 gap-2 px-4 text-xs",
    icon: "size-3.5",
  },
  l: {
    button: "h-10 gap-2 px-5 text-sm",
    icon: "size-4",
  },
} satisfies Record<Size, { button: string; icon: string }>;

const iconActionSizeStyles = {
  s: {
    button: "size-7",
    icon: "size-3",
  },
  m: {
    button: "size-8",
    icon: "size-3.5",
  },
  l: {
    button: "size-9",
    icon: "size-4",
  },
} satisfies Record<Size, { button: string; icon: string }>;

function Button({
  children,
  variant = "secondary",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconActionButton({
  icon: Icon,
  size,
  transparent,
  onClick,
  ariaLabel,
  danger = false,
  tooltip,
  className = "",
  iconClassName,
}: IconActionButtonProps) {
  const styles = iconActionSizeStyles[size];
  const tooltipId = useId();

  const button = (
    <Button
      variant={danger ? "danger-ghost" : "secondary"}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={tooltip ? tooltipId : undefined}
      title={tooltip ? undefined : ariaLabel}
      className={`${styles.button} shrink-0 p-0 ${
        transparent ? "border-transparent hover:border-transparent" : ""
      } ${className}`}
    >
      <Icon className={iconClassName ?? styles.icon} />
    </Button>
  );

  if (!tooltip) return button;

  return (
    <span className="group/icon relative inline-flex shrink-0">
      {button}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-[calc(100%+0.5rem)] z-50 whitespace-nowrap border border-[var(--line-strong)] bg-[var(--panel)] px-2.5 py-1.5 text-[9px] font-bold text-[var(--text-strong)] opacity-0 shadow-[0_6px_18px_var(--shadow)] transition-opacity group-hover/icon:opacity-100 group-focus-within/icon:opacity-100"
      >
        {tooltip}
      </span>
    </span>
  );
}

export function EditIconButton({
  size,
  transparent,
  onClick,
  ariaLabel = "編集",
}: IconActionButtonBaseProps) {
  return (
    <IconActionButton
      icon={Pencil}
      size={size}
      transparent={transparent}
      onClick={onClick}
      ariaLabel={ariaLabel}
    />
  );
}

export function DeleteIconButton({
  size,
  transparent,
  onClick,
  ariaLabel = "削除",
}: IconActionButtonBaseProps) {
  return (
    <IconActionButton
      icon={Trash2}
      size={size}
      transparent={transparent}
      onClick={onClick}
      ariaLabel={ariaLabel}
      danger
    />
  );
}

export function FloatingIconButton({
  icon: Icon,
  onClick,
  ariaLabel,
  title,
  tooltip = ariaLabel,
  className = "",
}: FloatingIconButtonProps) {
  const tooltipId = useId();

  return (
    <div className="group fixed right-5 bottom-5 z-10">
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-[calc(100%+0.5rem)] whitespace-nowrap border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-strong)] opacity-0 shadow-[0_6px_18px_var(--shadow)] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {tooltip}
      </span>

      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        title={title}
        className={`cyber-cut-sm flex size-12 cursor-pointer items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xl transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-105 ${className}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function FloatingAddButton({
  text,
  onClick,
}: FloatingAddButtonProps) {
  return (
    <FloatingIconButton
      icon={Plus}
      onClick={onClick}
      ariaLabel={text}
      tooltip={text}
    />
  );
}

export function AddButton({
  text,
  size,
  onClick,
}: AddButtonProps) {
  const styles = sizeStyles[size];

  return (
    <Button
      variant="primary"
      onClick={onClick}
      className={styles.button}
    >
      <Plus className={styles.icon} />
      {text}
    </Button>
  );
}

export function OutlineAddButton({
  text,
  onClick,
}: Omit<AddButtonProps, "size">) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      className="h-8 gap-1.5 px-3 text-[9px] font-bold text-[var(--accent)]"
    >
      <Plus className="size-3" />
      {text}
    </Button>
  );
}

export function BulkDeleteButton({
  size,
  count,
  onConfirm,
  itemLabel = "完了済みのタスク",
}: BulkDeleteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const styles = sizeStyles[size];

  return (
    <>
      <Button
        variant="danger-ghost"
        disabled={count === 0}
        onClick={() => setIsDialogOpen(true)}
        className={styles.button}
      >
        <Trash2 className={styles.icon} />
        完了済みを削除 ({count})
      </Button>

      {isDialogOpen && (
        <DeleteDialog
          title={`${itemLabel}を削除しますか？`}
          text={`${itemLabel}${count}件を一括削除します。この操作は取り消せません。`}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={() => {
            onConfirm();
            setIsDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
