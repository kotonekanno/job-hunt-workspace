import type {
  Essay,
  EssayGroupListItem as EssayGroup,
} from '@/api/generated/models';
import { useState, type FormEvent } from 'react';
import { useCompanyList } from '@/features/companies/hooks/useCompanyList';
import type { CreateEssayRequest } from '@/api/generated/models';
import { RequestStatus } from '@/shared/RequestStatus';
import { unclassifiedEssayGroupId } from '@/features/essay/model/essay';
import { EssayGroupCombobox } from '@/features/essay/ui/EssayGroupCombobox';
import { CompanyCombobox } from '@/shared/CompanyCombobox';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

type EssayDialogProps = {
  groups: EssayGroup[];
  onClose: () => void;
  onSave: (groupId: string, request: CreateEssayRequest) => Promise<void>;
  essay?: Essay;
  defaultGroupId?: string;
};

export function EssayDialog({
  groups,
  onClose,
  onSave,
  essay,
  defaultGroupId,
}: EssayDialogProps) {
  const companies = useCompanyList();
  const [company, setCompany] = useState(essay?.companyName ?? '');
  const [groupId, setGroupId] = useState(
    defaultGroupId ?? unclassifiedEssayGroupId,
  );
  const [question, setQuestion] = useState(essay?.question ?? '');
  const [answer, setAnswer] = useState(essay?.answer ?? '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selected = companies.allCompanies.find(
      (item) => item.name === company,
    );
    if (company && !selected)
      throw new Error('企業一覧の読み込み後、企業を選択してください。');
    await onSave(groupId, {
      companyId: selected?.id ?? null,
      question: question.trim(),
      answer: answer.trim(),
    });
    onClose();
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
        <RequestStatus
          isLoading={companies.isLoading}
          error={companies.error}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="text-xs font-bold text-[var(--text-strong)]">
              企業名
            </span>
            <CompanyCombobox
              value={company}
              options={companies.allCompanies.map((company) => company.name)}
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
