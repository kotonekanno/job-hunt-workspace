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
    <div className="cyber-cut border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_6px_24px_var(--shadow)]">
      <SearchBox
        value={query}
        onValueChange={onQueryChange}
        placeholder={placeholder}
      />
    </div>
  );
}
