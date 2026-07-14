import {
  Check,
  Clock3,
  GitBranch,
  Minus,
  X,
  type LucideIcon,
} from "lucide-react";
import type { SelectionResult } from "../model/companyDetail";
import type { Size } from "@/shared/shared-type";
import { HoverCard } from "@/shared/hover-card";

type StatusProps = {
  result: SelectionResult;
  size: Size;
};

type BadgeProps = {
  title: string;
  step: string;
  result: SelectionResult;
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

const statusText: Record<SelectionResult, string> = {
  not_started: "未受験",
  pending: "結果待ち",
  passed: "合格",
  failed: "不合格",
};

export function SelectionStatusBadge({
  result,
  size,
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
        ${statusColorStyle[result]}
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

function SelectionStepBadge({
  title,
  step,
  result,
  size,
}: SelectionStepBadgeProps) {

  return (
    <HoverCard
      sizeClassName="w-56"
      placement="bottom-end"
      trigger={
        <SelectionStatusBadge
          result={result}
          size={size}
        />
      }
    >
      <div className="relative">
        <span className="absolute -top-3 -left-3 h-0.5 w-16 bg-[var(--accent)]" />

        <div className="flex items-center gap-2 pt-1">
          <span className="flex size-7 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
            <GitBranch className="size-3.5" />
          </span>

          <div className="min-w-0">
            <p className="font-mono text-[8px] font-bold tracking-[0.16em] text-[var(--faint)]">
              CURRENT SELECTION
            </p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--muted)]">
              {title}
            </p>
          </div>
        </div>

        <div className="mt-3 border-l-2 border-[var(--accent)] bg-[var(--panel-raised)] px-3 py-2.5">
          <p className="font-mono text-[8px] font-semibold tracking-wider text-[var(--faint)]">
            CURRENT STEP
          </p>
          <p className="mt-1 text-sm font-black leading-5 text-[var(--text-strong)]">
            {step}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2.5">
          <span className="text-[9px] font-semibold text-[var(--faint)]">
            選考状況
          </span>
          <SelectionStatusBadge result={result} size="s" />
        </div>
      </div>
    </HoverCard>
  );
}

export function SelectionStepBadgeForHeader({
  title,
  step,
  result,
}: BadgeProps) {
  return (
    <SelectionStepBadge
      title={title}
      step={step}
      result={result}
      size="l"
    />
  );
}

export function SelectionStepBadgeForCard({
  title,
  step,
  result,
}: BadgeProps) {
  return (
    <SelectionStepBadge
      title={title}
      step={step}
      result={result}
      size="m"
    />
  );
}
