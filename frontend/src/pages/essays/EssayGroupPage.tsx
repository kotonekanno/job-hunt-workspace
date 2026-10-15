import { RequestStatus } from '@/shared/RequestStatus';
import { essayGroupKey } from '@/features/essay/model/essay';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEssayArchive } from '@/features/essay/hooks/useEssayArchive';
import { EssayDialog } from '@/features/essay/ui/EssayDialog';
import { EssayGroupHeader } from '@/features/essay/ui/EssayGroupHeader';
import { EssayList } from '@/features/essay/ui/EssayList';
import { EssayToolbar } from '@/features/essay/ui/EssayToolbar';
import { BackLink } from '@/shared/BackLink';
import { FloatingAddButton } from '@/shared/button';

export function EssayGroupPage() {
  const { groupId } = useParams();
  const essayArchive = useEssayArchive();
  const [query, setQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const group = essayArchive.groups.find(
    (candidate) => essayGroupKey(candidate.id) === groupId,
  );
  const groupEssays = useMemo(
    () => essayArchive.essaysByGroup[groupId ?? ''] ?? [],
    [essayArchive.essaysByGroup, groupId],
  );
  const filteredEssays = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return groupEssays;
    }

    return groupEssays.filter((essay) =>
      [essay.companyName, essay.question, essay.answer].some((value) =>
        (value ?? '').toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [groupEssays, query]);

  if (!group) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/essays">ES文章ストックへ戻る</BackLink>
        <div className="ui-empty-state mt-5 border border-dashed border-[var(--line-strong)] py-16 text-center">
          <p className="text-sm font-bold text-[var(--muted)]">
            {essayArchive.isLoading
              ? '読み込み中…'
              : essayArchive.error ||
                '指定されたジャンルは見つかりませんでした'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <EssayGroupHeader name={group.name} essayCount={groupEssays.length} />

      <RequestStatus
        isLoading={essayArchive.isLoading}
        error={essayArchive.error}
      />
      <EssayToolbar query={query} onQueryChange={setQuery} />

      <div className="mt-5">
        <EssayList
          essays={filteredEssays}
          groups={essayArchive.groups}
          groupId={essayGroupKey(group.id)}
          onSave={essayArchive.updateEssay}
          onDelete={essayArchive.deleteEssay}
          onGroupChange={(essay, nextGroupId) =>
            essayArchive.moveEssay(essay.id, nextGroupId)
          }
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
          defaultGroupId={essayGroupKey(group.id)}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={essayArchive.addEssay}
        />
      )}
    </div>
  );
}
