import {
  ChevronRight,
  Clock3,
  Ellipsis,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import type { ActivitySender } from '@/features/companies/model/activity';
import { ActivitySenderOptions } from '@/features/companies/ui/detail/ActivitySenderOptions';

export type ActivityEditField = 'text' | 'sentAt';

export function ActivityMessageMenu({
  onEdit,
  onDelete,
  sender,
  onSenderChange,
}: {
  onEdit: (field: ActivityEditField) => void;
  onDelete: () => void;
  sender: ActivitySender;
  onSenderChange: (sender: ActivitySender) => void;
}) {
  const items = [
    { field: 'text' as const, label: 'メッセージを編集', icon: Pencil },
    { field: 'sentAt' as const, label: '日時を編集', icon: Clock3 },
  ];
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="メッセージの操作"
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        >
          <Ellipsis aria-hidden="true" className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="ui-floating-surface z-50 p-1"
        >
          {items.map(({ field, label, icon: Icon }) => (
            <DropdownMenu.Item
              key={field}
              onSelect={() => onEdit(field)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-[var(--text)] outline-none data-[highlighted]:bg-[var(--accent-soft)]"
            >
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-[var(--text)] outline-none data-[highlighted]:bg-[var(--accent-soft)] data-[state=open]:bg-[var(--accent-soft)]">
              <UserRound aria-hidden="true" className="size-3.5" />
              送信者を編集
              <ChevronRight aria-hidden="true" className="ml-auto size-3.5" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                sideOffset={4}
                className="ui-floating-surface z-50 min-w-36 p-1"
              >
                <ActivitySenderOptions
                  sender={sender}
                  onChange={onSenderChange}
                />
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--line)]" />
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
