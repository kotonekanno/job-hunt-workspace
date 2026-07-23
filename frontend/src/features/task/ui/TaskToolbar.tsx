import { BulkDeleteButton } from "@/shared/button";
import { SearchBox } from "@/shared/SearchBox";

type TaskToolbarProps = {
  companyQuery: string;
  completedCount: number;
  onCompanyQueryChange: (value: string) => void;
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
      <div className="min-w-0 flex-1 sm:max-w-xs">
        <SearchBox
          value={props.companyQuery}
          onValueChange={props.onCompanyQueryChange}
          placeholder="企業名で検索"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <BulkDeleteButton
          size="m"
          count={props.completedCount}
          onConfirm={props.onDeleteCompleted}
        />
      </div>
    </div>
  );
}
