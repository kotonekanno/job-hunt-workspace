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

type IconActionButtonProps = {
  size: Size;
  transparent: boolean;
  onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  ariaLabel?: string;
};

type BulkDeleteButtonProps = {
  size: Size;
  count: number;
  onConfirm: () => void;
  itemLabel?: string;
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

function IconActionButton({
  icon: Icon,
  size,
  transparent,
  onClick,
  ariaLabel,
  danger = false,
}: IconActionButtonProps & {
  icon: LucideIcon;
  danger?: boolean;
}) {
  const styles = iconActionSizeStyles[size];

  return (
    <Button
      variant={danger ? "danger-ghost" : "secondary"}
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`${styles.button} shrink-0 p-0 ${
        transparent ? "border-transparent hover:border-transparent" : ""
      }`}
    >
      <Icon className={styles.icon} />
    </Button>
  );
}

export function EditIconButton({
  size,
  transparent,
  onClick,
  ariaLabel = "編集",
}: IconActionButtonProps) {
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
}: IconActionButtonProps) {
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
