import {
  GripVertical,
  Lock,
} from "lucide-react";
import {
  Reorder,
  useDragControls,
} from "motion/react";
import {
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import {
  unclassifiedEssayGroupId,
  type EssayGroup,
} from "@/features/essay/model/essay";
import { EditDialog } from "@/shared/dialog";

type EssayGroupReorderDialogProps = {
  groups: EssayGroup[];
  onClose: () => void;
  onSave: (orderedGroupIds: string[]) => void;
};

type ReorderableGroupRowProps = {
  group: EssayGroup;
};

export function EssayGroupReorderDialog({
  groups,
  onClose,
  onSave,
}: EssayGroupReorderDialogProps) {
  const [orderedGroups, setOrderedGroups] = useState(
    groups.filter((group) => group.id !== unclassifiedEssayGroupId),
  );
  const unclassifiedGroup = groups.find(
    (group) => group.id === unclassifiedEssayGroupId,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave([
      ...orderedGroups.map((group) => group.id),
      ...(unclassifiedGroup ? [unclassifiedGroup.id] : []),
    ]);
    onClose();
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
            />
          ))}
        </Reorder.Group>

        {unclassifiedGroup && (
          <div className="mt-2 flex min-h-11 items-center gap-3 border border-[var(--line)] bg-[var(--panel-raised)] px-4 text-[var(--muted)] opacity-70">
            <span className="min-w-0 flex-1 truncate text-xs font-bold">
              {unclassifiedGroup.name}
            </span>
            <span className="flex size-7 items-center justify-center" title="常に末尾に表示">
              <Lock className="size-3.5" />
            </span>
          </div>
        )}
      </div>
    </EditDialog>
  );
}

function ReorderableGroupRow({
  group,
}: ReorderableGroupRowProps) {
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
      layout="position"
      transition={{
        layout: {
          type: "spring",
          stiffness: 420,
          damping: 34,
          mass: 0.75,
        },
      }}
      whileDrag={{
        x: 0,
        zIndex: 20,
        boxShadow: "0 12px 28px var(--shadow)",
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
