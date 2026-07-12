import { useMemo, useState } from "react";
import {
  initialEssays,
  type Essay,
} from "@/features/essay/model/essay";

export function useEssays() {
  const [essays, setEssays] = useState(initialEssays);
  const [query, setQuery] = useState("");
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);

  const traits = useMemo(
    () => [...new Set(essays.flatMap((essay) => essay.traits))].sort(),
    [essays],
  );

  const filteredEssays = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return essays.filter((essay) => {
      const matchesTrait = !selectedTrait || essay.traits.includes(selectedTrait);
      const matchesQuery = !normalizedQuery
        || essay.question.toLocaleLowerCase().includes(normalizedQuery)
        || essay.answer.toLocaleLowerCase().includes(normalizedQuery);

      return matchesTrait && matchesQuery;
    });
  }, [essays, query, selectedTrait]);

  const addEssay = (essay: Omit<Essay, "id">) => {
    setEssays((current) => [
      { ...essay, id: Date.now() },
      ...current,
    ]);
  };

  return {
    essays: filteredEssays,
    totalCount: essays.length,
    query,
    selectedTrait,
    traits,
    setQuery,
    setSelectedTrait,
    addEssay,
  };
}
