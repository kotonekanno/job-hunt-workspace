import { useRef, useState, type FormEvent } from 'react';
import { companyNameOptions } from '@/features/companies/model/companyList';
import {
  unclassifiedEssayGroupId,
  type Essay,
} from '@/features/essay/model/essay';
import type { EssayForm } from '@/features/essay/lib/essayGroupsApi';
import {
  EssayGroupCombobox,
  type EssayGroupOption,
} from '@/features/essay/ui/EssayGroupCombobox';
import { CompanyCombobox } from '@/shared/CompanyCombobox';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

type EssayDialogProps = {
  groups: EssayGroupOption[];
  companyOptions?: readonly string[];
  onClose: () => void;
  onSave: (essay: EssayForm) => void | Promise<boolean>;
  essay?: Essay;
  defaultGroupId?: string;
};

export function EssayDialog({
  groups,
  companyOptions = companyNameOptions,
  onClose,
  onSave,
  essay,
  defaultGroupId,
}: EssayDialogProps) {
  const [company, setCompany] = useState(essay?.company ?? '');
  const [groupId, setGroupId] = useState(
    essay?.groupId ?? defaultGroupId ?? unclassifiedEssayGroupId,
  );
  const [question, setQuestion] = useState(essay?.question ?? '');
  const [answer, setAnswer] = useState(essay?.answer ?? '');

  const saving = useRef(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim() || saving.current) return;
    saving.current = true;
    try {
      const saved = await onSave({
        company,
        groupId,
        question: question.trim(),
        answer: answer.trim(),
      });
      if (saved !== false) onClose();
    } finally {
      saving.current = false;
    }
  }

  return (
    <EditDialog
      title={essay ? 'ESの文章を編集' : 'ESの文章を追加'}
      subTitle="ESSAY ARCHIVE"
      submitText="保存する"
      onClose={onClose}
      onSubmit={handleSubmit}
      formClassName="max-w-2xl p-6"
    >
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="text-xs font-bold text-[var(--text-strong)]">
              企業名
            </span>
            <CompanyCombobox
              clearSearchOnOpen
              value={company}
              options={companyOptions}
              allowEmpty
              onValueChange={setCompany}
              placeholder="企業名を検索"
              emptyLabel="未選択"
              invalidMessage="企業一覧から企業名を選択してください。"
              noResultsText="該当する企業はありません"
              clearAriaLabel="企業を未選択にする"
              className="mt-2"
            />
          </label>

          <label className="block min-w-0">
            <span className="text-xs font-bold text-[var(--text-strong)]">
              質問の性質
              <RequiredMark />
            </span>
            <EssayGroupCombobox
              clearSearchOnOpen
              value={groupId}
              groups={groups}
              onValueChange={setGroupId}
              className="mt-2"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-[var(--text-strong)]">
            設問
            <RequiredMark />
          </span>
          <textarea
            required
            maxLength={1000}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            placeholder="企業から提示された設問を入力"
            className="mt-2 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm leading-7 text-[var(--text)] outline-none transition-colors hover:border-[var(--line-strong)] focus:border-[var(--accent)]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold text-[var(--text-strong)]">
            回答
            <RequiredMark />
          </span>
          <textarea
            required
            maxLength={5000}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={9}
            placeholder="設問に対して書いた文章を入力"
            className="mt-2 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm leading-7 text-[var(--text)] outline-none transition-colors hover:border-[var(--line-strong)] focus:border-[var(--accent)]"
          />
          <span className="mt-1 block text-right font-mono text-[9px] text-[var(--faint)]">
            {answer.length} 文字
          </span>
        </label>
      </>
    </EditDialog>
  );
}
