import { GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import type { Task } from "@/features/task/model/task";
import { CompanyBadge } from "@/shared/badge";
import { DeleteIconButton, EditIconButton } from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";
import { useState } from "react";

type TaskRowProps = {
  task: Task;
  canReorder: boolean;
  showCompany?: boolean;
  showReorder?: boolean;
  showActions?: boolean;
  onToggle: (id: number) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
};

export function TaskRow(props: TaskRowProps) {
  const dragControls = useDragControls();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const showCompany = props.showCompany ?? true;
  const showReorder = props.showReorder ?? true;
  const showActions = props.showActions ?? true;
  const gridTemplateColumns = [
    "28px",
    showCompany ? "minmax(64px, 108px)" : null,
    "minmax(120px, 1fr)",
    "108px",
    showActions ? "36px" : null,
    showActions ? "36px" : null,
    showReorder ? "28px" : null,
  ].filter(Boolean).join(" ");
  
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
              open:border-[var(--line-strong)] hover:border-[var(--accent)] hover:shadow-[0_6px_16px_var(--shadow)]
            "
        >
          <summary
            className="grid min-h-14 cursor-pointer list-none items-center gap-2 px-4 [&::-webkit-details-marker]:hidden"
            style={{ gridTemplateColumns }}
          >
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
                ? <CompanyBadge company={props.task.company} />
                : <span aria-hidden="true" />
            )}
            <span
              className={`
                truncate text-sm font-semibold ml-2
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
            {showActions && (
              <>
                <EditIconButton
                  size="m"
                  transparent={false}
                  onClick={(event) => {
                    event.preventDefault();
                    props.onEdit?.(props.task);
                  }}
                />
                <DeleteIconButton
                  size="m"
                  transparent={false}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                />
              </>
            )}
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
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            props.onDelete?.(props.task.id);
            setIsDeleteDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
