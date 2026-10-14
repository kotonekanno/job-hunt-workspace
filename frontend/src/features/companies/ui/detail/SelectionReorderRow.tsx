import { Reorder, useDragControls } from 'motion/react';
import { Trash2 } from 'lucide-react';
import type { SelectionStep } from '@/features/companies/model/selection';
import { DragHandle } from '@/shared/DragHandle';

export function SelectionReorderRow({
  step,
  index,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  step: SelectionStep;
  index: number;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={step.id}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onPointerCancel={onDragEnd}
      className="relative flex min-h-12 items-center gap-3 border border-[var(--line)] bg-[var(--panel-raised)] pl-3"
    >
      <span className="font-mono text-sm font-bold text-[var(--accent)]">
        STEP {index + 1}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--text)]">
        {step.title}
      </span>
      <button
        type="button"
        aria-label={`${step.title}を削除`}
        onClick={onDelete}
        className="flex size-8 cursor-pointer items-center justify-center text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-500"
      >
        <Trash2 className="size-4" />
      </button>
      <DragHandle
        title="ドラッグして並べ替え"
        label={`${step.title}を並べ替え`}
        onPointerDown={(event) => {
          event.preventDefault();
          controls.start(event);
        }}
      />
    </Reorder.Item>
  );
}
