import { GripVertical } from 'lucide-react';
import type { PointerEventHandler } from 'react';

type DragHandleProps = {
  label: string;
  title: string;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  raised?: boolean;
  compact?: boolean;
};

export function DragHandle({ label, title, onPointerDown, raised = false, compact = false }: DragHandleProps) {
  return (
    <button
      type="button"
      data-card-action
      onPointerDown={onPointerDown}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      aria-label={label}
      title={title}
      className={`flex ${compact ? 'w-8' : 'w-11'} shrink-0 self-stretch touch-none cursor-grab items-center justify-center text-[var(--faint)] transition-colors hover:text-[var(--accent)] active:cursor-grabbing ${raised ? 'hover:bg-[var(--accent-soft)]' : 'hover:bg-[var(--panel-raised)]'}`}
    >
      <GripVertical aria-hidden="true" className="size-4" />
    </button>
  );
}
