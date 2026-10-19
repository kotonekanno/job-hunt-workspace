import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEssayGroup } from '@/features/essay/hooks/useEssayGroup';
import { essayGroupApiId } from '@/features/essay/lib/essayRoutes';
import { EssayDialog } from '@/features/essay/ui/EssayDialog';
import { EssayGroupHeader } from '@/features/essay/ui/EssayGroupHeader';
import { EssayList } from '@/features/essay/ui/EssayList';
import { EssayToolbar } from '@/features/essay/ui/EssayToolbar';
import { BackLink } from '@/shared/BackLink';
import { FloatingAddButton } from '@/shared/button';

export function EssayGroupPage() {
  const { groupId } = useParams();
  return <EssayGroupDetail key={groupId} groupId={essayGroupApiId(groupId)} />;
}

function EssayGroupDetail({ groupId }: { groupId: string | undefined }) {
  const essayArchive = useEssayGroup(groupId);
  const [query, setQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const groupEssays = essayArchive.essays;
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

  if (essayArchive.status !== 'ready' || !groupId || !essayArchive.groupName) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/essays">ES文章ストックへ戻る</BackLink>
        <div className="ui-empty-state mt-5 border border-dashed border-[var(--line-strong)] py-16 text-center">
          <p className="text-sm font-bold text-[var(--muted)]">
            {essayArchive.status === 'loading'
              ? '読み込み中…'
              : essayArchive.status === 'error'
                ? '文章一覧を取得できませんでした。画面を再読み込みしてください。'
                : '指定されたジャンルは見つかりませんでした'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <EssayGroupHeader
        name={essayArchive.groupName}
        essayCount={groupEssays.length}
      />

      <EssayToolbar query={query} onQueryChange={setQuery} />

      <div className="mt-5">
        <EssayList
          essays={filteredEssays}
          groups={essayArchive.groupOptions}
          groupId={groupId}
          onSave={essayArchive.updateEssay}
          onDelete={essayArchive.deleteEssay}
          onGroupChange={essayArchive.moveEssay}
          searchQuery={query}
        />
      </div>

      <FloatingAddButton
        text="文章を追加"
        onClick={() => setIsAddDialogOpen(true)}
      />

      {isAddDialogOpen && (
        <EssayDialog
          groups={essayArchive.groupOptions}
          defaultGroupId={groupId}
          companyOptions={essayArchive.companyOptions}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={essayArchive.addEssay}
        />
      )}
    </div>
  );
}
