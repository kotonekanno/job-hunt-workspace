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

  const updateEssay = (
    essayId: number,
    updates: Partial<Pick<Essay, "question" | "answer">>,
  ) => {
    setEssays((current) => current.map((essay) =>
      essay.id === essayId ? { ...essay, ...updates } : essay));
  };

  const deleteEssay = (essayId: number) => {
    setEssays((current) => current.filter(
      (essay) => essay.id !== essayId,
    ));
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
    updateEssay,
    deleteEssay,
  };
}
