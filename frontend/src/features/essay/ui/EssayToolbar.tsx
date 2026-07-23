import { SlidersHorizontal } from "lucide-react";
import { SearchBox } from "@/shared/SearchBox";

type EssayToolbarProps = {
  query: string;
  traits: string[];
  selectedTrait: string | null;
  onQueryChange: (query: string) => void;
  onTraitChange: (trait: string | null) => void;
};

export function EssayToolbar({
  query,
  traits,
  selectedTrait,
  onQueryChange,
  onTraitChange,
}: EssayToolbarProps) {
  return (
    <div className="cyber-cut border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_6px_24px_var(--shadow)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <SearchBox
            value={query}
            onValueChange={onQueryChange}
            placeholder="設問・本文を検索"
          />
        </div>
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
