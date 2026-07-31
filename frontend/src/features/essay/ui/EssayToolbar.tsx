import { SearchBox } from "@/shared/SearchBox";

type EssayToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
};

export function EssayToolbar({
  query,
  onQueryChange,
  placeholder = "設問・回答を検索",
}: EssayToolbarProps) {
  return (
    <div className="ui-panel cyber-cut border border-[var(--line)] p-4">
      <SearchBox
        value={query}
        onValueChange={onQueryChange}
        placeholder={placeholder}
      />
    </div>
  );
}
