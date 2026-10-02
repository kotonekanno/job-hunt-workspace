import { SearchBox } from "@/shared/SearchBox";

type CompanyListToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
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
    </div>
  );
}
