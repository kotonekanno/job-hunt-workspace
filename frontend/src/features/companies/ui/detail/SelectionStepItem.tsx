import { ChevronDown } from 'lucide-react';

import type {
  SelectionStatus,
  SelectionStep,
} from '@/features/companies/model/selection';
import { SelectionStepBadge } from '@/features/companies/ui/selection-step-badge';
import { MemoPanel } from '@/shared/MemoPanel';

type SelectionStepItemProps = {
  trackName: string;
  step: SelectionStep;
  index: number;
  isCurrent: boolean;
  onResultChange: (result: SelectionStatus) => void;
};

export function SelectionStepItem({
  trackName,
  step,
  index,
  isCurrent,
  onResultChange,
}: SelectionStepItemProps) {
  return (
    <details
      open
      className="group/step relative"
      aria-current={isCurrent ? 'step' : undefined}
    >
      <summary className="relative grid min-h-12 cursor-pointer list-none grid-cols-[minmax(0,1fr)_64px_72px_14px] items-center gap-2 border border-[var(--line)] bg-[var(--panel-raised)] px-3 py-2 transition-colors hover:border-[var(--line-strong)] [&::-webkit-details-marker]:hidden">
        <span
          className={`absolute top-1/2 -left-[35px] z-10 flex size-7 -translate-y-1/2 items-center justify-center border-2 font-mono text-sm font-black ${isCurrent ? 'border-[var(--panel)] bg-[var(--accent)] text-[var(--accent-contrast)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--panel)] shadow-[0_0_12px_var(--accent-glow)]' : 'border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--muted)]'}`}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0 truncate pl-1 text-[13px] font-bold text-[var(--text-strong)]">
          {step.title}
        </span>

        <time
          dateTime={step.heldAt}
          className="flex w-16 shrink-0 items-center justify-start font-mono text-xs font-black text-[var(--text-strong)]"
        >
          {step.heldAt ? step.heldAt.slice(5).replace('-', '/') : '--/--'}
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

      <div className="border-x border-b border-[var(--line)]">
        <MemoPanel text={step.note} recessed />
      </div>
    </details>
  );
}
