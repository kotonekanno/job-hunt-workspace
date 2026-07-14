import { Search, SlidersHorizontal } from "lucide-react";
import { AddButton } from "@/shared/button";

type EssayToolbarProps = {
  query: string;
  traits: string[];
  selectedTrait: string | null;
  onQueryChange: (query: string) => void;
  onTraitChange: (trait: string | null) => void;
  onAdd: () => void;
};

export function EssayToolbar({
  query,
  traits,
  selectedTrait,
  onQueryChange,
  onTraitChange,
  onAdd,
}: EssayToolbarProps) {
  return (
    <div className="cyber-cut border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_6px_24px_var(--shadow)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--faint)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="設問・本文を検索"
            className="h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] pr-3 pl-9 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <AddButton
          text="文章を追加"
          size="m"
          onClick={onAdd}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
        <span className="mr-1 flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
          <SlidersHorizontal className="size-3.5" />
        </span>

        <button
          type="button"
          onClick={() => onTraitChange(null)}
          className={`cursor-pointer border px-3 py-1.5 text-[10px] font-bold transition-colors ${selectedTrait === null ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]"}`}
        >
          すべて
        </button>

        {traits.map((trait) => (
          <button
            key={trait}
            type="button"
            onClick={() => onTraitChange(trait)}
            className={`cursor-pointer border px-3 py-1.5 text-[10px] font-bold transition-colors ${selectedTrait === trait ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]"}`}
          >
            {trait}
          </button>
        ))}
      </div>
    </div>
  );
}
