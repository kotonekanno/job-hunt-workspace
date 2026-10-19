import { ArrowRight, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import { essayGroupUrl } from '@/features/essay/lib/essayRoutes';
import { groupPathId } from '@/features/essay/lib/essayGroupsApi';
import { EditDeleteMenu } from '@/shared/EditDeleteMenu';

type EssayGroupListProps = {
  groups: EssayGroupListItem[];
  onAddGroup: () => void;
  onEditGroup: (group: EssayGroupListItem) => void;
  onDeleteGroup: (group: EssayGroupListItem) => void;
};

export function EssayGroupList({
  groups,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
}: EssayGroupListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3x">
      {groups.map((group) => {
        const essayCount = group.quantity;
        const canManage = group.id !== null;

        return (
          <article
            key={groupPathId(group.id)}
            className="ui-panel-interactive relative min-h-36 overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-[0_3px_12px_var(--shadow)] hover:border-[var(--accent)]"
          >
            <Link
              to={essayGroupUrl(group.id)}
              onClick={(event) => {
                if (group.id !== null && group.id < 0) event.preventDefault();
              }}
              className="group flex h-full min-h-36 cursor-pointer items-center gap-4 p-5 pr-14"
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-[var(--accent)] opacity-35 transition-opacity group-hover:opacity-100" />

              <div className="flex size-11 shrink-0 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--accent)] transition-colors group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-soft)]">
                <FileText className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-mono text-[8px] font-bold tracking-[0.16em] text-[var(--faint)]">
                  QUESTION GENRE
                </p>
                <h2 className="mt-1 truncate text-lg font-black text-[var(--text-strong)]">
                  {group.name}
                </h2>
                <p className="mt-2 font-mono text-[10px] font-bold text-[var(--muted)]">
                  <span className="text-sm text-[var(--text-strong)]">
                    {essayCount}
                  </span>
                  <span className="ml-1">ESSAYS</span>
                </p>
              </div>

              <ArrowRight className="absolute bottom-5 right-5 size-4 text-[var(--faint)] transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
            </Link>

            {canManage && (
              <div className="absolute right-4 top-4 flex items-center gap-1.5 bg-[var(--panel)] pl-2">
                <EditDeleteMenu
                  label={group.name}
                  onEdit={() => onEditGroup(group)}
                  onDelete={() => onDeleteGroup(group)}
                />
              </div>
            )}
          </article>
        );
      })}

      <button
        type="button"
        onClick={onAddGroup}
        className="group flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-[var(--line-strong)] bg-[var(--panel)] p-5 text-[var(--muted)] transition-[border-color,color,background-color] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      >
        <span className="flex size-9 items-center justify-center border border-current">
          <Plus className="size-4" />
        </span>
        <span className="text-xs font-bold">新しいジャンルを追加</span>
      </button>
    </div>
  );
}
