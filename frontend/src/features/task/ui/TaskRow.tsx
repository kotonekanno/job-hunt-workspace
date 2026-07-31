import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Task } from "@/features/task/model/task";
import { CompanyBadge } from "@/shared/badge";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";

type TaskRowProps = {
  task: Task;
  showCompany?: boolean;
  showActions?: boolean;
  onToggle: (id: number) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
};

export function TaskRow(props: TaskRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const showCompany = props.showCompany ?? true;
  const showActions = props.showActions ?? true;
  const gridTemplateColumns = [
    "28px",
    showCompany ? "minmax(64px, 108px)" : null,
    "minmax(120px, 1fr)",
    "108px",
    showActions ? "36px" : null,
    showActions ? "36px" : null,
    "20px",
  ].filter(Boolean).join(" ");

  return (
    <>
      <details
        className="
          ui-panel-interactive group cyber-cut relative border border-[var(--line)]
          bg-[var(--panel)] shadow-[0_4px_16px_var(--shadow)]
          transition-[border-color,box-shadow] duration-200
          open:border-[var(--line-strong)] hover:border-[var(--accent)]
          hover:shadow-[0_6px_16px_var(--shadow)]
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
            className="size-4 cursor-pointer accent-[var(--accent)]"
            aria-label={`${props.task.title}を完了にする`}
          />

          {showCompany && (
            props.task.company
              ? <CompanyBadge company={props.task.company} />
              : <span aria-hidden="true" />
          )}

          <span
            className={`
              ml-2 truncate text-sm font-semibold
              ${props.task.completed
                ? "text-[var(--faint)] line-through"
                : "text-[var(--text-strong)]"
              }
            `}
          >
            {props.task.title}
          </span>

          {props.task.dueDate ? (
            <time
              dateTime={props.task.dueDate}
              className="font-mono text-sm font-bold text-[var(--text-strong)]"
            >
              {props.task.dueDate.slice(5).replace("-", "/")}
              <span className="ml-1 text-[10px] font-medium text-[var(--muted)]">
                まで
              </span>
            </time>
          ) : (
            <span className="text-[10px] font-medium text-[var(--faint)]">
              期限なし
            </span>
          )}

          {showActions && (
            <>
              <EditIconButton
                size="m"
                transparent={false}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
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

          <ChevronDown className="size-4 shrink-0 text-[var(--faint)] transition-transform duration-200 group-open:rotate-180" />
        </summary>

        <div className="border-t border-[var(--line)] bg-[var(--panel-raised)] px-12 py-4">
          <p className="text-[12px] leading-7 text-[var(--text)]">
            {props.task.description}
          </p>
        </div>
      </details>

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
