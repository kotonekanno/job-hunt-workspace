import { InlineEssayField } from '@/features/essay/ui/InlineEssayField';
import { Check, ChevronDown, Copy, FilePenLine } from 'lucide-react';
import { useState } from 'react';
import type { Essay } from '@/api/generated/models/essay';
import type { UpdateEssayRequest } from '@/api/generated/models/updateEssayRequest';
import type { EssayGroupOption } from '@/features/essay/ui/EssayGroupCombobox';
import { toast } from '@/shared/toast';
import { EssayGroupMoveDialog } from '@/features/essay/ui/EssayGroupMoveDialog';
import { HighlightedEssayText } from '@/features/essay/ui/HighlightedEssayText';
import { CompanyBadge } from '@/shared/badge';
import { DeleteIconButton, IconActionButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { Select } from '@/shared/select';

const collapsedAnswerLength = 220;

type EssayListProps = {
  essays: Essay[];
  groups: EssayGroupOption[];
  groupId: string;
  onSave: (id: number, request: UpdateEssayRequest) => Promise<boolean>;
  onDelete: (essayId: number) => Promise<boolean>;
  onGroupChange: (essay: Essay, groupId: string) => Promise<boolean>;
  searchQuery?: string;
};

type EssayListItemProps = {
  essay: Essay;
  groups: EssayGroupOption[];
  groupId: string;
  onSave: (id: number, request: UpdateEssayRequest) => Promise<boolean>;
  onDelete: (essayId: number) => Promise<boolean>;
  onGroupChange: (essay: Essay, groupId: string) => Promise<boolean>;
  searchQuery: string;
};

export function EssayList({
  essays,
  groups,
  groupId,
  onSave,
  onDelete,
  onGroupChange,
  searchQuery = '',
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
          groupId={groupId}
          onSave={onSave}
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
  groupId,
  onSave,
  onDelete,
  onGroupChange,
  searchQuery,
}: EssayListItemProps) {
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const isLongAnswer = essay.answer?.length ?? 0 > collapsedAnswerLength;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const answerMatchesQuery = Boolean(
    normalizedQuery &&
    essay.answer.toLocaleLowerCase().includes(normalizedQuery),
  );
  const visibleAnswer =
    isLongAnswer && !isAnswerExpanded && !answerMatchesQuery
      ? `${essay.answer.slice(0, collapsedAnswerLength)}…`
      : essay.answer;
  const currentGroup = groups.find((group) => group.id === groupId);
  const pendingGroup = groups.find((group) => group.id === pendingGroupId);

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(essay.answer);
    } catch {
      toast.error('回答をコピーできませんでした。');
      return;
    }
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1600);
  }

  return (
    <>
      <article className="ui-panel-interactive border border-[var(--line)] bg-[var(--panel)] shadow-[0_3px_12px_var(--shadow)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <div className="min-w-0 flex-1">
            {essay.companyName && (
              <CompanyBadge
                company={essay.companyName}
                className="inline-block max-w-full px-2"
              />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Select
              value={groupId}
              options={groups.map((group) => ({
                value: group.id,
                label: group.name,
              }))}
              onValueChange={(nextGroupId) => {
                if (nextGroupId !== groupId) setPendingGroupId(nextGroupId);
              }}
              aria-label="質問の性質を変更"
              className="h-7 max-w-40 py-0 text-[10px] font-bold"
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
          <InlineEssayField
            label="QUESTION"
            value={essay.question}
            maxLength={1000}
            required
            onSave={(question) => onSave(essay.id, { question })}
          >
            <p className="whitespace-pre-wrap text-sm font-normal leading-7 text-[var(--text)]">
              <HighlightedEssayText text={essay.question} query={searchQuery} />
            </p>
          </InlineEssayField>
          <InlineEssayField
            label="ANSWER"
            value={essay.answer}
            maxLength={5000}
            onSave={(answer) => onSave(essay.id, { answer })}
            action={
              <IconActionButton
                icon={isCopied ? Check : Copy}
                size="s"
                transparent
                ariaLabel={isCopied ? 'コピーしました' : '回答をコピー'}
                onClick={copyAnswer}
              />
            }
          >
            {isLongAnswer && !answerMatchesQuery ? (
              <button
                type="button"
                onClick={() => setIsAnswerExpanded((current) => !current)}
                className="group/answer block w-full cursor-pointer text-left"
                aria-expanded={isAnswerExpanded}
              >
                <span className="block whitespace-pre-wrap text-sm font-normal leading-7 text-[var(--text)]">
                  <HighlightedEssayText
                    text={visibleAnswer}
                    query={searchQuery}
                  />
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)]">
                  {isAnswerExpanded ? '折りたたむ' : '全文を表示'}
                  <ChevronDown
                    className={`size-3.5 transition-transform ${
                      isAnswerExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>
            ) : (
              <p className="whitespace-pre-wrap text-sm font-normal leading-7 text-[var(--text)]">
                <HighlightedEssayText
                  text={visibleAnswer}
                  query={searchQuery}
                />
              </p>
            )}
          </InlineEssayField>
        </div>
      </article>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="ESを削除しますか？"
          text={`「${essay.question}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (await onDelete(essay.id)) setIsDeleteDialogOpen(false);
          }}
        />
      )}

      {currentGroup && pendingGroup && (
        <EssayGroupMoveDialog
          currentGroupName={currentGroup.name}
          nextGroupName={pendingGroup.name}
          onClose={() => setPendingGroupId(null)}
          onConfirm={async () => {
            if (await onGroupChange(essay, pendingGroup.id))
              setPendingGroupId(null);
          }}
        />
      )}
    </>
  );
}
