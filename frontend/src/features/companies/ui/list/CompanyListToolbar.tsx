import {
  progressOptions,
  type CompanyProgress,
} from "@/features/companies/model/companyList";
import { SearchBox } from "@/shared/SearchBox";
import { Select, toSelectOptions } from "@/shared/select";

type CompanyListToolbarProps = {
  query: string;
  progress: CompanyProgress | "すべて";
  onQueryChange: (query: string) => void;
  onProgressChange: (progress: CompanyProgress | "すべて") => void;
};

export function CompanyListToolbar(props: CompanyListToolbarProps) {
  return (
    <div className="ui-panel cyber-cut flex flex-col justify-between gap-3 border border-[var(--line)] p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1 sm:max-w-sm">
        <SearchBox
          value={props.query}
          onValueChange={props.onQueryChange}
          placeholder="会社名で検索"
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
      </div>
    </div>
  );
}
