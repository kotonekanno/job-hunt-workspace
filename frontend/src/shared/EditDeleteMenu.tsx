import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';

type EditDeleteMenuProps = {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function EditDeleteMenu({
  label,
  onEdit,
  onDelete,
}: EditDeleteMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`${label}の操作`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className="ui-control flex size-8 shrink-0 cursor-pointer items-center justify-center text-[var(--faint)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <Ellipsis aria-hidden="true" className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          onClick={(event) => event.stopPropagation()}
          className="ui-floating-surface z-50 min-w-32 p-1"
        >
          <DropdownMenu.Item
            onSelect={onEdit}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-[var(--text)] outline-none data-[highlighted]:bg-[var(--accent-soft)]"
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            編集
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={onDelete}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-rose-500 outline-none data-[highlighted]:bg-[var(--accent-soft)]"
          >
            <Trash2 aria-hidden="true" className="size-3.5" />
            削除
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
