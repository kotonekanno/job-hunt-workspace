import { GripVertical, Lock } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { useRef, useState, type FormEvent, type PointerEvent } from 'react';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import { EditDialog } from '@/shared/dialog';

type EssayGroupReorderDialogProps = {
  groups: EssayGroupListItem[];
  onClose: () => void;
  onSave: (orderedGroupIds: number[], movedIds: number[]) => Promise<boolean>;
};

type ReorderableGroupRowProps = {
  group: EssayGroupListItem;
  onDrop: () => void;
};

export function EssayGroupReorderDialog({
  groups,
  onClose,
  onSave,
}: EssayGroupReorderDialogProps) {
  const [orderedGroups, setOrderedGroups] = useState(
    groups.filter((group) => group.id !== null),
  );
  const unclassifiedGroup = groups.find((group) => group.id === null);

  const saving = useRef(false);
  const movedIds = useRef(new Set<number>());
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    try {
      if (
        await onSave(
          orderedGroups.flatMap((group) =>
            group.id === null ? [] : [group.id],
          ),
          [...movedIds.current],
        )
      )
        onClose();
    } finally {
      saving.current = false;
    }
  }

  return (
    <EditDialog
      title="ジャンルを並べ替え"
      subTitle="REORDER GENRES"
      submitText="保存する"
      onClose={onClose}
      onSubmit={handleSubmit}
      formClassName="max-w-lg p-6"
    >
      <div>
        <p className="mb-3 text-xs leading-5 text-[var(--muted)]">
          右端のハンドルをドラッグして表示順を変更できます。
        </p>

        <Reorder.Group
          axis="y"
          values={orderedGroups}
          onReorder={setOrderedGroups}
          className="space-y-2 p-0"
        >
          {orderedGroups.map((group) => (
            <ReorderableGroupRow
              key={group.id}
              group={group}
              onDrop={() => {
                if (group.id !== null) movedIds.current.add(group.id);
              }}
            />
          ))}
        </Reorder.Group>

        {unclassifiedGroup && (
          <div className="mt-2 flex min-h-11 items-center gap-3 border border-[var(--line)] bg-[var(--panel-raised)] px-4 text-[var(--muted)] opacity-70">
            <span className="min-w-0 flex-1 truncate text-xs font-bold">
              {unclassifiedGroup.name}
            </span>
            <span
              className="flex size-7 items-center justify-center"
              title="常に末尾に表示"
            >
              <Lock className="size-3.5" />
            </span>
          </div>
        )}
      </div>
    </EditDialog>
  );
}

function ReorderableGroupRow({ group, onDrop }: ReorderableGroupRowProps) {
  const dragControls = useDragControls();

  function startDragging(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragControls.start(event);
  }

  return (
    <Reorder.Item
      value={group}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDrop}
      layout="position"
      transition={{
        layout: {
          type: 'spring',
          stiffness: 420,
          damping: 34,
          mass: 0.75,
        },
      }}
      whileDrag={{
        x: 0,
        zIndex: 20,
        boxShadow: '0 12px 28px var(--shadow)',
      }}
      className="flex min-h-11 list-none items-center gap-3 border border-[var(--line)] bg-[var(--panel)] pl-4"
    >
      <span className="min-w-0 flex-1 truncate text-xs font-bold text-[var(--text-strong)]">
        {group.name}
      </span>
      <button
        type="button"
        onPointerDown={startDragging}
        aria-label={`${group.name}を並べ替え`}
        title="ドラッグして並べ替え"
        className="flex min-h-11 w-11 touch-none cursor-grab items-center justify-center border-l border-[var(--line)] text-[var(--faint)] transition-colors hover:bg-[var(--panel-raised)] hover:text-[var(--accent)] active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
    </Reorder.Item>
  );
}
