import {
  Pencil,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { DeleteDialog } from "@/shared/dialog";
import type { Size } from "@/shared/shared-type";
import { Tooltip } from "@/shared/tooltip";

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
  primary: "cyber-cut-sm border-[var(--accent)] bg-[var(--accent)] font-bold text-[var(--accent-contrast)] shadow-[0_4px_14px_var(--accent-glow)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  secondary: "border-[var(--line)] bg-[var(--panel-raised)] font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[0_3px_10px_var(--shadow)]",
  "danger-ghost": "border-[var(--line)] bg-[var(--panel-raised)] font-semibold text-[var(--muted)] hover:border-rose-500 hover:text-rose-500",
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
      className={`ui-control inline-flex cursor-pointer items-center justify-center border disabled:cursor-not-allowed disabled:opacity-40 ${variantStyles[variant]} ${className}`}
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
  const button = (
    <Button
      variant={danger ? "danger-ghost" : "secondary"}
      onClick={onClick}
      aria-label={ariaLabel}
      title={tooltip ? undefined : ariaLabel}
      className={`${styles.button} shrink-0 p-0 ${
        transparent
          ? "border-transparent bg-transparent hover:border-transparent hover:bg-[var(--panel-raised)]"
          : ""
      } ${className}`}
    >
      <Icon className={iconClassName ?? styles.icon} />
    </Button>
  );

  if (!tooltip) return button;

  return <Tooltip content={tooltip}>{button}</Tooltip>;
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
  return (
    <div className="fixed right-5 bottom-5 z-10">
      <Tooltip content={tooltip}>
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          title={title}
          className={`ui-control cyber-cut-sm flex size-12 cursor-pointer items-center justify-center border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_10px_28px_var(--shadow),0_0_18px_var(--accent-glow)] hover:-translate-y-0.5 hover:brightness-105 ${className}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>
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
