import { ChevronDown, FilePenLine } from "lucide-react";
import type { Essay } from "@/features/essay/model/essay";

type EssayListProps = {
  essays: Essay[];
};

export function EssayList({ essays }: EssayListProps) {
  if (essays.length === 0) {
    return (
      <div className="border border-dashed border-[var(--line-strong)] bg-[var(--panel)] py-16 text-center">
        <FilePenLine className="mx-auto size-7 text-[var(--faint)]" />
        <p className="mt-3 text-sm font-bold text-[var(--muted)]">
          条件に一致する文章はありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {essays.map((essay, index) => (
        <details
          key={essay.id}
          className="group border border-[var(--line)] bg-[var(--panel)] shadow-[0_3px_12px_var(--shadow)] open:border-[var(--line-strong)]"
        >
          <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center bg-[var(--accent-soft)] font-mono text-[9px] font-black text-[var(--accent)]">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-6 text-[var(--text-strong)]">
                {essay.question}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {essay.traits.map((trait) => (
                  <span
                    key={trait}
                    className="border border-[var(--line-strong)] bg-[var(--panel-raised)] px-2 py-0.5 text-[9px] font-semibold text-[var(--muted)]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <ChevronDown className="mt-1 size-4 shrink-0 text-[var(--faint)] transition-transform group-open:rotate-180" />
          </summary>

          <div className="border-t border-[var(--line)] px-4 py-5 sm:pl-14">
            <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[var(--accent)]">
              ANSWER
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">
              {essay.answer}
            </p>
            <p className="mt-4 text-right font-mono text-[9px] text-[var(--faint)]">
              {essay.answer.length} 文字
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
