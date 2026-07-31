import {
  Check,
  ChevronDown,
  Copy,
  FilePenLine,
} from "lucide-react";
import { useState } from "react";
import type {
  Essay,
  EssayGroup,
} from "@/features/essay/model/essay";
import { EssayGroupMoveDialog } from "@/features/essay/ui/EssayGroupMoveDialog";
import { HighlightedEssayText } from "@/features/essay/ui/HighlightedEssayText";
import { CompanyBadge } from "@/shared/badge";
import {
  DeleteIconButton,
  EditIconButton,
  IconActionButton,
} from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";
import { Select } from "@/shared/select";

const collapsedAnswerLength = 220;

type EssayListProps = {
  essays: Essay[];
  groups: EssayGroup[];
  onEdit: (essay: Essay) => void;
  onDelete: (essayId: number) => void;
  onGroupChange: (essay: Essay, groupId: string) => void;
  searchQuery?: string;
};

type EssayListItemProps = {
  essay: Essay;
  groups: EssayGroup[];
  onEdit: (essay: Essay) => void;
  onDelete: (essayId: number) => void;
  onGroupChange: (essay: Essay, groupId: string) => void;
  searchQuery: string;
};

export function EssayList({
  essays,
  groups,
  onEdit,
  onDelete,
  onGroupChange,
  searchQuery = "",
}: EssayListProps) {
  if (essays.length === 0) {
    return (
      <div className="ui-empty-state border border-dashed border-[var(--line-strong)] py-16 text-center">
        <FilePenLine className="mx-auto size-7 text-[var(--faint)]" />
        <p className="mt-3 text-sm font-bold text-[var(--muted)]">
          条件に一致する文章はありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {essays.map((essay) => (
        <EssayListItem
          key={essay.id}
          essay={essay}
          groups={groups}
          onEdit={onEdit}
          onDelete={onDelete}
          onGroupChange={onGroupChange}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}

function EssayListItem({
  essay,
  groups,
  onEdit,
  onDelete,
  onGroupChange,
  searchQuery,
}: EssayListItemProps) {
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const isLongAnswer = essay.answer.length > collapsedAnswerLength;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const answerMatchesQuery = Boolean(
    normalizedQuery
    && essay.answer.toLocaleLowerCase().includes(normalizedQuery),
  );
  const visibleAnswer = isLongAnswer
    && !isAnswerExpanded
    && !answerMatchesQuery
    ? `${essay.answer.slice(0, collapsedAnswerLength)}…`
    : essay.answer;
  const currentGroup = groups.find((group) => group.id === essay.groupId);
  const pendingGroup = groups.find((group) => group.id === pendingGroupId);

  async function copyAnswer() {
    await navigator.clipboard.writeText(essay.answer);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1600);
  }

  return (
    <>
      <article className="ui-panel-interactive border border-[var(--line)] bg-[var(--panel)] shadow-[0_3px_12px_var(--shadow)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <div className="min-w-0 flex-1">
            {essay.company && (
              <CompanyBadge
                company={essay.company}
                className="inline-block max-w-full px-2"
              />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Select
              value={essay.groupId}
              options={groups.map((group) => ({
                value: group.id,
                label: group.name,
              }))}
              onValueChange={(groupId) => {
                if (groupId !== essay.groupId) setPendingGroupId(groupId);
              }}
              aria-label="質問の性質を変更"
              className="h-7 max-w-40 py-0 text-[10px] font-bold"
            />
            <EditIconButton
              size="s"
              transparent={false}
              ariaLabel="ESを編集"
              onClick={() => onEdit(essay)}
            />
            <DeleteIconButton
              size="s"
              transparent={false}
              ariaLabel="ESを削除"
              onClick={() => setIsDeleteDialogOpen(true)}
            />
          </div>
        </div>

        <div>
          <section className="border-b border-[var(--line)] p-4">
            <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[var(--accent)]">
              QUESTION
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-normal leading-7 text-[var(--text)]">
              <HighlightedEssayText
                text={essay.question}
                query={searchQuery}
              />
            </p>
          </section>

          <section className="p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[var(--accent)]">
                ANSWER
              </p>
              <IconActionButton
                icon={isCopied ? Check : Copy}
                size="s"
                transparent={false}
                ariaLabel={isCopied ? "コピーしました" : "回答をコピー"}
                tooltip={isCopied ? "コピーしました" : "回答をコピー"}
                onClick={copyAnswer}
                iconClassName={isCopied ? "size-3 text-emerald-500" : undefined}
              />
            </div>

            {isLongAnswer && !answerMatchesQuery ? (
              <button
                type="button"
                onClick={() => setIsAnswerExpanded((current) => !current)}
                className="group/answer mt-2 block w-full cursor-pointer text-left"
                aria-expanded={isAnswerExpanded}
              >
                <span className="block whitespace-pre-wrap text-sm font-normal leading-7 text-[var(--text)]">
                  <HighlightedEssayText
                    text={visibleAnswer}
                    query={searchQuery}
                  />
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)]">
                  {isAnswerExpanded ? "折りたたむ" : "全文を表示"}
                  <ChevronDown
                    className={`size-3.5 transition-transform ${
                      isAnswerExpanded ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm font-normal leading-7 text-[var(--text)]">
                <HighlightedEssayText
                  text={visibleAnswer}
                  query={searchQuery}
                />
              </p>
            )}
          </section>
        </div>

      </article>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="ESを削除しますか？"
          text={`「${essay.question}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            onDelete(essay.id);
            setIsDeleteDialogOpen(false);
          }}
        />
      )}

      {currentGroup && pendingGroup && (
        <EssayGroupMoveDialog
          currentGroupName={currentGroup.name}
          nextGroupName={pendingGroup.name}
          onClose={() => setPendingGroupId(null)}
          onConfirm={() => {
            onGroupChange(essay, pendingGroup.id);
            setPendingGroupId(null);
          }}
        />
      )}
    </>
  );
}
