import { GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import type { Task } from "@/features/task/model/task";
import { DeleteIconButton, EditIconButton } from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";
import { useState } from "react";

type TaskRowProps = {
  task: Task;
  canReorder: boolean;
  showCompany?: boolean;
  showReorder?: boolean;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export function TaskRow(props: TaskRowProps) {
  const dragControls = useDragControls();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const showCompany = props.showCompany ?? true;
  const showReorder = props.showReorder ?? true;
  const gridClassName = showCompany
    ? showReorder
      ? "grid-cols-[28px_minmax(64px,108px)_minmax(120px,1fr)_108px_36px_36px_28px]"
      : "grid-cols-[28px_minmax(64px,108px)_minmax(120px,1fr)_108px_36px_36px]"
    : showReorder
      ? "grid-cols-[28px_minmax(120px,1fr)_108px_36px_36px_28px]"
      : "grid-cols-[28px_minmax(120px,1fr)_108px_36px_36px]";
  
  return (
    <>
      <Reorder.Item
      value={props.task}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      transition={{ layout: { type: "spring", stiffness: 420, damping: 34, mass: 0.75 } }}
      whileDrag={{ x: 0, zIndex: 20, boxShadow: "0 16px 36px var(--shadow)" }}
      className="w-full list-none"
    >
      <details
        className="
          group cyber-cut relative border border-[var(--line)]
            bg-[var(--panel)] shadow-[0_4px_16px_var(--shadow)]
            transition-[border-color,box-shadow] duration-200
            open:border-[var(--line-strong)]
          "
      >
        <summary className={`grid min-h-14 list-none items-center gap-2 px-4 [&::-webkit-details-marker]:hidden ${gridClassName}`}>
          <input
            type="checkbox"
            checked={props.task.completed}
            onChange={() => props.onToggle(props.task.id)}
            onClick={(event) => event.stopPropagation()}
            className="size-4 accent-[var(--accent)]"
            aria-label={`${props.task.title}を完了にする`}
          />
          {showCompany && (
            props.task.company
              ? <span
                  className="
                    truncate border border-[var(--line)] bg-[var(--panel-raised)]
                    px-1.5 py-1 text-center text-[9px] text-[var(--muted)]
                  "
                >
                  {props.task.company}
                </span>
              : <span aria-hidden="true" />
          )}
          <span
            className={`
              truncate text-sm font-semibold
              ${props.task.completed
                ? "text-[var(--faint)] line-through"
                : "text-[var(--text-strong)]"
              }
            `}
          >
            {props.task.title}
          </span>
          <time className="font-mono text-sm font-bold text-[var(--text-strong)]">
            {props.task.dueDate.slice(5).replace("-", "/")} <span className="text-[10px] font-medium text-[var(--muted)]">まで</span>
          </time>
          <EditIconButton
            onClick={(event) => {
              event.preventDefault();
              props.onEdit(props.task);
            }}
          />
          <DeleteIconButton
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
          />
          {showReorder && (
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault(); if (props.canReorder) dragControls.start(event);
              }}
              className={`
                flex size-8 touch-none items-center justify-center text-[var(--faint)]
                ${props.canReorder
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-not-allowed opacity-30"
                }
              `}
              title={props.canReorder ? "ドラッグして並べ替え" : "手動ソート時のみ並べ替え可能"}
            >
              <GripVertical className="size-4" />
            </button>
          )}
        </summary>
        <div className="border-t border-[var(--line)] bg-[var(--panel-raised)] px-12 py-4">
          <p className="text-[12px] leading-7 text-[var(--text)]">
            {props.task.description}
          </p>
        </div>
      </details>
      </Reorder.Item>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="タスクを削除しますか？"
          text={`「${props.task.title}」を削除します。この操作は取り消せません。`}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onDelete={() => {
            props.onDelete(props.task.id);
            setIsDeleteDialogOpen(false);
          }}
          onBackdropClick={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
}
