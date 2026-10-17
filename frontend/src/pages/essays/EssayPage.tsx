import { ArrowUpDown, FilePenLine } from 'lucide-react';
import { useState } from 'react';
import { useEssayGroups } from '@/features/essay/hooks/useEssayGroups';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import { groupPathId } from '@/features/essay/lib/essayGroupsApi';
import { unclassifiedEssayGroupId } from '@/features/essay/model/essay';
import { EssayDialog } from '@/features/essay/ui/EssayDialog';
import { EssayGroupDialog } from '@/features/essay/ui/EssayGroupDialog';
import { EssayGroupList } from '@/features/essay/ui/EssayGroupList';
import { EssayGroupReorderDialog } from '@/features/essay/ui/EssayGroupReorderDialog';
import { FloatingAddButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { InnerHeader } from '@/shared/header';

export function EssayPage() {
  const essayArchive = useEssayGroups();
  const [isEssayDialogOpen, setIsEssayDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EssayGroupListItem | null>(
    null,
  );
  const [deletingGroup, setDeletingGroup] = useState<EssayGroupListItem | null>(
    null,
  );
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="relative pr-32">
        <InnerHeader
          title="ES文章ストック"
          subTitle="ESSAY ARCHIVE"
          icon={<FilePenLine className="size-5 text-[var(--accent)]" />}
        />

        <button
          type="button"
          onClick={() => setIsReorderDialogOpen(true)}
          className="absolute right-0 top-0 inline-flex h-9 cursor-pointer items-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-[10px] font-bold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <ArrowUpDown className="size-3.5" />
          並べ替え
        </button>
      </div>

      <EssayGroupList
        groups={essayArchive.groups}
        onAddGroup={() => setIsGroupDialogOpen(true)}
        onEditGroup={setEditingGroup}
        onDeleteGroup={setDeletingGroup}
      />

      <FloatingAddButton
        text="文章を追加"
        onClick={() => setIsEssayDialogOpen(true)}
      />

      {isEssayDialogOpen && (
        <EssayDialog
          groups={[
            ...essayArchive.groups.map((group) => ({
              id: groupPathId(group.id),
              name: group.name,
            })),
            ...(essayArchive.groups.some((group) => group.id === null)
              ? []
              : [{ id: unclassifiedEssayGroupId, name: '未分類' }]),
          ]}
          companyOptions={essayArchive.companyOptions}
          defaultGroupId={unclassifiedEssayGroupId}
          onClose={() => setIsEssayDialogOpen(false)}
          onSave={essayArchive.addEssay}
        />
      )}

      {isGroupDialogOpen && (
        <EssayGroupDialog
          onClose={() => setIsGroupDialogOpen(false)}
          onSave={essayArchive.addGroup}
        />
      )}

      {editingGroup && (
        <EssayGroupDialog
          groupName={editingGroup.name}
          onClose={() => setEditingGroup(null)}
          onSave={(name) =>
            editingGroup.id === null
              ? Promise.resolve(false)
              : essayArchive.updateGroup(editingGroup.id, name)
          }
        />
      )}

      {deletingGroup && (
        <DeleteDialog
          title={`「${deletingGroup.name}」を削除しますか？`}
          text="このジャンルに含まれるESは削除されず、「未分類」へ移動します。"
          onClose={() => setDeletingGroup(null)}
          onConfirm={async () => {
            if (
              deletingGroup.id !== null &&
              (await essayArchive.deleteGroup(deletingGroup.id))
            )
              setDeletingGroup(null);
          }}
        />
      )}

      {isReorderDialogOpen && (
        <EssayGroupReorderDialog
          groups={essayArchive.groups}
          onClose={() => setIsReorderDialogOpen(false)}
          onSave={essayArchive.reorderGroups}
        />
      )}
    </div>
  );
}
