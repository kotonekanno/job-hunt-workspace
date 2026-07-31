import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useEssayArchive } from "@/features/essay/hooks/useEssayArchive";
import type { Essay } from "@/features/essay/model/essay";
import { EssayDialog } from "@/features/essay/ui/EssayDialog";
import { EssayGroupHeader } from "@/features/essay/ui/EssayGroupHeader";
import { EssayList } from "@/features/essay/ui/EssayList";
import { EssayToolbar } from "@/features/essay/ui/EssayToolbar";
import { BackLink } from "@/shared/BackLink";
import { FloatingAddButton } from "@/shared/button";

export function EssayGroupPage() {
  const { groupId } = useParams();
  const essayArchive = useEssayArchive();
  const [query, setQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEssay, setEditingEssay] = useState<Essay | null>(null);
  const group = essayArchive.groups.find(
    (candidate) => candidate.id === groupId,
  );
  const groupEssays = useMemo(() => essayArchive.essays.filter(
    (essay) => essay.groupId === groupId,
  ), [essayArchive.essays, groupId]);
  const filteredEssays = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return groupEssays;
    }

    return groupEssays.filter((essay) => [
      essay.company,
      essay.question,
      essay.answer,
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)));
  }, [groupEssays, query]);

  if (!group) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/essays">ES文章ストックへ戻る</BackLink>
        <div className="mt-5 border border-dashed border-[var(--line-strong)] bg-[var(--panel)] py-16 text-center">
          <p className="text-sm font-bold text-[var(--muted)]">
            指定されたジャンルは見つかりませんでした
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <EssayGroupHeader
        name={group.name}
        essayCount={groupEssays.length}
      />

      <EssayToolbar
        query={query}
        onQueryChange={setQuery}
      />

      <div className="mt-5">
        <EssayList
          essays={filteredEssays}
          groups={essayArchive.groups}
          onEdit={setEditingEssay}
          onDelete={essayArchive.deleteEssay}
          onGroupChange={(essay, nextGroupId) => essayArchive.updateEssay(
            essay.id,
            { ...essay, groupId: nextGroupId },
          )}
          searchQuery={query}
        />
      </div>

      <FloatingAddButton
        text="文章を追加"
        onClick={() => setIsAddDialogOpen(true)}
      />

      {isAddDialogOpen && (
        <EssayDialog
          groups={essayArchive.groups}
          defaultGroupId={group.id}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={essayArchive.addEssay}
        />
      )}

      {editingEssay && (
        <EssayDialog
          groups={essayArchive.groups}
          essay={editingEssay}
          onClose={() => setEditingEssay(null)}
          onSave={(essay) => essayArchive.updateEssay(
            editingEssay.id,
            essay,
          )}
        />
      )}
    </div>
  );
}
