import {
  ArrowRight,
  FileText,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  unclassifiedEssayGroupId,
  type Essay,
  type EssayGroup,
} from "@/features/essay/model/essay";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/shared/button";

type EssayGroupListProps = {
  groups: EssayGroup[];
  essays: Essay[];
  onAddGroup: () => void;
  onEditGroup: (group: EssayGroup) => void;
  onDeleteGroup: (group: EssayGroup) => void;
};

export function EssayGroupList({
  groups,
  essays,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
}: EssayGroupListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => {
        const essayCount = essays.filter(
          (essay) => essay.groupId === group.id,
        ).length;
        const canManage = group.id !== unclassifiedEssayGroupId;

        return (
          <article
            key={group.id}
            className="relative min-h-36 overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-[0_3px_12px_var(--shadow)] transition-[border-color,box-shadow] hover:border-[var(--accent)] hover:shadow-[0_6px_20px_var(--shadow)]"
          >
            <Link
              to={`/essays/${group.id}`}
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
                <EditIconButton
                  size="s"
                  transparent={false}
                  ariaLabel={`${group.name}を編集`}
                  onClick={() => onEditGroup(group)}
                />
                <DeleteIconButton
                  size="s"
                  transparent={false}
                  ariaLabel={`${group.name}を削除`}
                  onClick={() => onDeleteGroup(group)}
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
