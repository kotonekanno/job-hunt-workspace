import {
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { useState } from "react";
import type {
  SelectionStatus,
  SelectionStep,
} from "@/features/companies/model/selection";
import { SelectionStepBadge } from "@/features/companies/ui/selection-step-badge";
import {
  EditIconButton,
  IconActionButton,
} from "@/shared/button";

type SelectionStepItemProps = {
  trackName: string;
  step: SelectionStep;
  index: number;
  onResultChange: (result: SelectionStatus) => void;
  onMemoChange: (memo: string) => void;
};

export function SelectionStepItem({
  trackName,
  step,
  index,
  onResultChange,
  onMemoChange,
}: SelectionStepItemProps) {
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoDraft, setMemoDraft] = useState(step.note);

  function startEditingMemo() {
    setMemoDraft(step.note);
    setIsEditingMemo(true);
  }

  function saveMemo() {
    onMemoChange(memoDraft);
    setIsEditingMemo(false);
  }

  function cancelEditingMemo() {
    setMemoDraft(step.note);
    setIsEditingMemo(false);
  }

  return (
    <details className="group/step relative">
      <summary className="relative grid min-h-12 cursor-pointer list-none grid-cols-[minmax(0,1fr)_64px_72px_14px] items-center gap-2 border border-[var(--line)] bg-[var(--panel-raised)] px-3 py-2 transition-colors hover:border-[var(--line-strong)] [&::-webkit-details-marker]:hidden">
        <span className="absolute top-1/2 -left-[35px] z-10 flex size-7 -translate-y-1/2 items-center justify-center border-2 border-[var(--panel)] bg-[var(--accent)] font-mono text-[8px] font-black text-[var(--accent-contrast)] shadow-[0_2px_6px_var(--shadow)]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 truncate pl-1 text-xs font-bold text-[var(--text-strong)]">
          {step.title}
        </span>

        <time
          dateTime={step.heldAt}
          className="flex w-16 shrink-0 items-center justify-start font-mono text-[11px] font-black text-[var(--text-strong)]"
        >
          {step.heldAt
            ? step.heldAt.slice(5).replace("-", "/")
            : "--/--"}
        </time>

        <span
          className="inline-flex"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <SelectionStepBadge
            title={trackName}
            step={step.title}
            result={step.status}
            size="s"
            showContext={false}
            compactMenu
            onResultChange={onResultChange}
          />
        </span>

        <ChevronDown className="size-3 text-[var(--faint)] transition-transform duration-200 group-open/step:rotate-180" />
      </summary>

      <div className="border-x border-b border-[var(--line)] bg-[var(--panel)] px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-mono text-[8px] font-bold tracking-[0.16em] text-[var(--faint)]">
            MEMO
          </p>

          {isEditingMemo ? (
            <div className="flex items-center gap-1">
              <IconActionButton
                icon={Check}
                size="s"
                transparent={true}
                onClick={saveMemo}
              />

              <IconActionButton
                icon={X}
                size="s"
                transparent={true}
                onClick={cancelEditingMemo}
              />
            </div>
          ) : (
            <EditIconButton
              size="s"
              transparent={true}
              onClick={startEditingMemo}
            />
          )}
        </div>

        {isEditingMemo ? (
          <textarea
            autoFocus
            value={memoDraft}
            onChange={(event) => setMemoDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                cancelEditingMemo();
              }

              if (
                event.key === "Enter"
                && (event.metaKey || event.ctrlKey)
              ) {
                saveMemo();
              }
            }}
            aria-label={`${step.title}のメモ`}
            className="min-h-24 w-full cursor-text resize-y border border-[var(--line-strong)] bg-[var(--panel-raised)] p-3 text-[11px] leading-5 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--faint)] focus:border-[var(--accent)]"
            placeholder="詳細を入力"
          />
        ) : (
          <p className={`min-h-8 whitespace-pre-wrap text-[11px] leading-5 ${
            step.note
              ? "text-[var(--muted)]"
              : "text-[var(--faint)]"
          }`}>
            {step.note}
          </p>
        )}
      </div>
    </details>
  );
}
