import { useEffect, useMemo, useState } from 'react';
import { essayGroupPath } from '@/features/essay/model/essay';
import { useParams } from 'react-router-dom';
import { useEssayArchive } from '@/features/essay/hooks/useEssayArchive';
import { EssayDialog } from '@/features/essay/ui/EssayDialog';
import { EssayGroupHeader } from '@/features/essay/ui/EssayGroupHeader';
import { EssayList } from '@/features/essay/ui/EssayList';
import { EssayToolbar } from '@/features/essay/ui/EssayToolbar';
import { BackLink } from '@/shared/BackLink';
import { FloatingAddButton } from '@/shared/button';

export function EssayGroupPage() {
  const { essayGroupId } = useParams();
  return <EssayGroupContent key={essayGroupId} groupId={essayGroupId ?? ''} />;
}
function EssayGroupContent({ groupId }: { groupId: string }) {
  const essayArchive = useEssayArchive();
  const [query, setQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const group = essayArchive.groups.find(
    (candidate) => essayGroupPath(candidate.id) === groupId,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const loadEssays = essayArchive.loadEssays;
  const groupExists = Boolean(group);
  useEffect(() => {
    if (!groupExists) return;
    const controller = new AbortController();
    async function load() {
      try {
        await loadEssays(groupId, controller.signal);
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : 'ES一覧を取得できませんでした。',
          );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [groupId, groupExists, loadEssays]);
  const groupEssays = useMemo(
    () => essayArchive.essaysByGroup.get(groupId) ?? [],
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
              ? 'ESグループを読み込み中…'
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

      {(error || essayArchive.error) && (
        <p role="alert" className="my-3 text-sm text-rose-500">
          {error || essayArchive.error}
        </p>
      )}
      {isLoading && (
        <p role="status" className="my-3 text-sm text-[var(--muted)]">
          ESを読み込み中…
        </p>
      )}
      <EssayToolbar query={query} onQueryChange={setQuery} />

      <div className="mt-5">
        <EssayList
          essays={filteredEssays}
          groups={essayArchive.groups}
          groupId={groupId}
          onSave={(id, patch) => essayArchive.updateEssay(groupId, id, patch)}
          onDelete={(id) => essayArchive.deleteEssay(groupId, id)}
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
          defaultGroupId={essayGroupPath(group.id)}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={essayArchive.addEssay}
        />
      )}
    </div>
  );
}
