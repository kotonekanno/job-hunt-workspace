import { Search } from "lucide-react";
import {
  progressOptions,
  type CompanyProgress,
} from "@/features/companies/model/companyList";
import { AddButton } from "@/shared/button";
import { Select, toSelectOptions } from "@/shared/select";

type CompanyListToolbarProps = {
  query: string;
  progress: CompanyProgress | "すべて";
  onQueryChange: (query: string) => void;
  onProgressChange: (progress: CompanyProgress | "すべて") => void;
  onAdd: () => void;
};

export function CompanyListToolbar(props: CompanyListToolbarProps) {
  return (
    <div className="cyber-cut flex flex-col justify-between gap-3 border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_6px_24px_var(--shadow)] sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--faint)]" />
        <input
          type="search"
          value={props.query}
          onChange={(event) => props.onQueryChange(event.target.value)}
          placeholder="会社名で検索"
          className="h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] pr-3 pl-9 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={props.progress}
          options={[
            { value: "すべて", label: "すべての選考状況" },
            ...toSelectOptions(progressOptions),
          ]}
          onValueChange={props.onProgressChange}
          className="h-10"
          aria-label="選考状況で絞り込む"
        />
        <AddButton text="企業を追加" size="m" onClick={props.onAdd} />
      </div>
    </div>
  );
}
