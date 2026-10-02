import { CirclePlay, Pause } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';

export function SelectionProgressMenu({
  title,
  isActive,
  onChange,
}: {
  title: string;
  isActive: boolean;
  onChange: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`${title}の進行設定`}
          title={isActive ? '進行中の選考' : '進行中の選考に設定する'}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className={`flex size-8 shrink-0 cursor-pointer items-center justify-center transition-colors ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]' : 'text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]'}`}
        >
          <CirclePlay aria-hidden="true" className="size-5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          onClick={(event) => event.stopPropagation()}
          className="ui-floating-surface z-50 p-1"
        >
          <DropdownMenu.Item
            onSelect={onChange}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-[var(--text)] outline-none data-[highlighted]:bg-[var(--accent-soft)]"
          >
            {isActive ? (
              <Pause className="size-4" />
            ) : (
              <CirclePlay className="size-4" />
            )}
            {isActive ? '進行中の選考から外す' : '進行中の選考に設定する'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
