import { Search, Trash2 } from "lucide-react";
import type { TaskSort } from "@/features/task/model/task";
import { BulkDeleteButton } from "@/shared/button";

type TaskToolbarProps = {
  companyQuery: string;
  sort: TaskSort;
  completedCount: number;
  onCompanyQueryChange: (value: string) => void;
  onSortChange: (value: TaskSort) => void;
  onDeleteCompleted: () => void;
};

export function TaskToolbar(props: TaskToolbarProps) {
  return (
    <div
      className="
        cyber-cut flex flex-col justify-between gap-3
        border border-[var(--line)] bg-[var(--panel)]
        p-4 shadow-[0_6px_24px_var(--shadow)] sm:flex-row sm:items-center
      "
    >
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--faint)]" />
        <input
          type="search"
          value={props.companyQuery}
          onChange={(event) => props.onCompanyQueryChange(event.target.value)}
          placeholder="企業名で検索"
          className="
            h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)]
            pr-3 pl-9 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]
          "
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={props.sort}
          onChange={(event) =>
            props.onSortChange(event.target.value as TaskSort)
          }
          className="
            h-10 border border-[var(--line)] bg-[var(--panel-raised)]
            px-3 text-xs text-[var(--text)] outline-none
            focus:border-[var(--accent)]
          "
          aria-label="タスクを並べ替える"
        >
          <option>手動</option>
          <option>期限が近い順</option>
          <option>企業名順</option>
        </select>
        <BulkDeleteButton
          size="l"
          count={props.completedCount}
          onClick={props.onDeleteCompleted}
        />
      </div>
    </div>
  );
}
