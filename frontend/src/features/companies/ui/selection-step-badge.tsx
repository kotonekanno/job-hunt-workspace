import {
  Check,
  Clock3,
  Minus,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import type { SelectionResult } from "../model/companyDetail";
import type { Size } from "@/shared/shared-type";
import { HoverCard } from "@/shared/hover-card";

type StatusProps = {
  result: SelectionResult;
  size: Size;
  interactive?: boolean;
};

type BadgeProps = {
  title: string;
  step: string;
  result: SelectionResult;
  onResultChange?: (result: SelectionResult) => void;
  showContext?: boolean;
  compactMenu?: boolean;
};

const icon: Record<SelectionResult, LucideIcon> = {
  not_started: Minus,
  passed: Check,
  failed: X,
  pending: Clock3,
};

const statusColorStyle: Record<SelectionResult, string> = {
  not_started:
    "border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)]",
  pending:
    "border-amber-500/50 bg-amber-500/10 text-amber-600",
  passed:
    "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
  failed:
    "border-blue-500/50 bg-blue-500/10 text-blue-600",
};

const interactiveStatusStyle: Record<SelectionResult, string> = {
  not_started:
    "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  pending:
    "hover:border-amber-500 hover:bg-amber-500 hover:text-white",
  passed:
    "hover:border-emerald-500 hover:bg-emerald-500 hover:text-white",
  failed:
    "hover:border-blue-500 hover:bg-blue-500 hover:text-white",
};

const statusText: Record<SelectionResult, string> = {
  not_started: "未受験",
  pending: "結果待ち",
  passed: "合格",
  failed: "不合格",
};

const selectionResults: SelectionResult[] = [
  "not_started",
  "pending",
  "passed",
  "failed",
];

export function SelectionStatusBadge({
  result,
  size,
  interactive = false,
}: StatusProps) {
  const Icon = icon[result];

  const styles = {
    s: {
      badge: "w-[72px] justify-center gap-1 px-2 py-1 text-[9px]",
      icon: "size-3",
    },
    m: {
      badge: "h-7 w-20 justify-center gap-1.5 px-2 text-[10px]",
      icon: "size-3.5",
    },
    l: {
      badge: "w-24 justify-center gap-1.5 px-3 py-2 text-[11px]",
      icon: "size-4",
    },
  } satisfies Record<Size, { badge: string; icon: string }>;

  const {
    badge: badgeStyle,
    icon: iconStyle,
  } = styles[size];

  return (
    <span
      className={`
        inline-flex shrink-0 items-center border font-semibold
        transition-colors
        ${statusColorStyle[result]}
        ${interactive ? interactiveStatusStyle[result] : ""}
        ${badgeStyle}
      `}
    >
      <Icon className={iconStyle} />
      {statusText[result]}
    </span>
  );
}

type SelectionStepBadgeProps = BadgeProps & {
  size: Size;
};

export function SelectionStepBadge({
  title,
  step,
  result,
  size,
  onResultChange,
  showContext = true,
  compactMenu = false,
}: SelectionStepBadgeProps) {
  const [selectedResult, setSelectedResult] = useState(result);

  useEffect(() => {
    setSelectedResult(result);
  }, [result]);

  function selectResult(nextResult: SelectionResult) {
    setSelectedResult(nextResult);
    onResultChange?.(nextResult);
  }

  return (
    <HoverCard
      sizeClassName={compactMenu ? "w-44" : "w-60"}
      placement="bottom-end"
      openOnHover={false}
      closeOnContentClick
      triggerClassName="inline-block cursor-pointer outline-none"
      trigger={
        <SelectionStatusBadge
          result={selectedResult}
          size={size}
          interactive
        />
      }
    >
      <div>
        {showContext && (
          <div className="border-b border-[var(--line)] px-1 pb-2.5">
            <p className="truncate text-[10px] font-semibold text-[var(--muted)]">
              {title}
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-4 w-0.5 shrink-0 bg-[var(--accent)]" />

              <p className="min-w-0 flex-1 truncate text-sm font-black text-[var(--text-strong)]">
                {step}
              </p>
            </div>
          </div>
        )}

        <div className={`px-1 ${showContext ? "pt-2.5" : ""}`}>
          <p className="font-mono text-[8px] font-bold tracking-[0.16em] text-[var(--accent)]">
            SELECTION STATUS
          </p>

          <div
            role="listbox"
            aria-label="選考状況"
            className="mt-1.5 space-y-0.5"
          >
            {selectionResults.map((option) => {
              const OptionIcon = icon[option];
              const isSelected = selectedResult === option;

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectResult(option)}
                  className={`flex w-full cursor-pointer items-center gap-2 border-l-2 text-left transition-colors ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-strong)]"
                      : "border-transparent text-[var(--muted)] hover:border-[var(--line-strong)] hover:bg-[var(--panel-raised)] hover:text-[var(--text-strong)]"
                  } ${compactMenu ? "px-2 py-1.5" : "px-2.5 py-2"}`}
                >
                  <span
                    className={`
                      flex size-5 shrink-0 items-center justify-center border
                      ${statusColorStyle[option]}
                    `}
                  >
                    <OptionIcon className="size-3" />
                  </span>

                  <span className="min-w-0 flex-1 text-[10px] font-bold">
                    {statusText[option]}
                  </span>

                  {isSelected && (
                    <Check className="size-3.5 shrink-0 text-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </HoverCard>
  );
}
