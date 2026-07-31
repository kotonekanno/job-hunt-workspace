import { useState, type FormEvent } from "react";
import { companyNameOptions } from "@/features/companies/model/companyList";
import type { Essay } from "@/features/essay/model/essay";
import { CompanyCombobox } from "@/shared/CompanyCombobox";
import { EditDialog } from "@/shared/dialog";
import { RequiredMark } from "@/shared/form";

type EssayDialogProps = {
  onClose: () => void;
  onSave: (essay: Omit<Essay, "id">) => void;
};

export function EssayDialog({
  onClose,
  onSave,
}: EssayDialogProps) {
  const [company, setCompany] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [traitInput, setTraitInput] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const traits = traitInput
      .split(/[,、]/)
      .map((trait) => trait.trim())
      .filter(Boolean);

    onSave({
      company,
      question,
      answer,
      traits: [...new Set(traits)],
    });
    onClose();
  };

  return (
    <EditDialog
      title="ESの文章を追加"
      subTitle="ESSAY ARCHIVE"
      submitText="保存する"
      onClose={onClose}
      onSubmit={handleSubmit}
      formClassName="max-w-2xl p-6"
    >
        <>
          <label className="block">
            <span className="text-xs font-bold text-[var(--text-strong)]">
              企業名
              <RequiredMark />
            </span>
            <CompanyCombobox
              required
              value={company}
              options={companyNameOptions}
              onValueChange={setCompany}
              placeholder="企業名を検索"
              className="mt-2"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-[var(--text-strong)]">
              設問
              <RequiredMark />
            </span>
            <textarea
              required
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
              placeholder="企業から提示された設問を入力"
              className="mt-2 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm leading-6 text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-[var(--text-strong)]">
              本文
              <RequiredMark />
            </span>
            <textarea
              required
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={8}
              placeholder="設問に対して書いた文章を入力"
              className="mt-2 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm leading-7 text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
            <span className="mt-1 block text-right font-mono text-[9px] text-[var(--faint)]">
              {answer.length} 文字
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-[var(--text-strong)]">
              質問の性質
              <RequiredMark />
            </span>
            <input
              required
              value={traitInput}
              onChange={(event) => setTraitInput(event.target.value)}
              placeholder="例：ガクチカ、チーム経験"
              className="mt-2 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
            <span className="mt-1.5 block text-[9px] text-[var(--faint)]">
              複数指定する場合は「、」またはカンマで区切ってください
            </span>
          </label>
        </>
    </EditDialog>
  );
}
