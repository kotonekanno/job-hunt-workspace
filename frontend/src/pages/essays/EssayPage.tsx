import { useState } from "react";
import { FilePenLine } from "lucide-react";
import { useEssays } from "@/features/essay/hooks/useEssays";
import { EssayDialog } from "@/features/essay/ui/EssayDialog";
import { EssayList } from "@/features/essay/ui/EssayList";
import { EssayToolbar } from "@/features/essay/ui/EssayToolbar";
import { InnerHeader } from "@/shared/header";

export function EssayPage() {
  const essayArchive = useEssays();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <InnerHeader
        title="ES文章ストック"
        subTitle="ESSAY ARCHIVE"
        description="設問と回答を蓄積し、過去に書いた表現をすぐに探せます。"
        icon={<FilePenLine className="size-5 text-[var(--accent)]" />}
      />

      <EssayToolbar
        query={essayArchive.query}
        traits={essayArchive.traits}
        selectedTrait={essayArchive.selectedTrait}
        onQueryChange={essayArchive.setQuery}
        onTraitChange={essayArchive.setSelectedTrait}
        onAdd={() => setIsDialogOpen(true)}
      />

      <div className="mt-5">
        <EssayList essays={essayArchive.essays} />
      </div>

      {isDialogOpen && (
        <EssayDialog
          onClose={() => setIsDialogOpen(false)}
          onSave={essayArchive.addEssay}
        />
      )}
    </div>
  );
}
