import { ArrowUpRight } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CompanyListItem } from '@/features/companies/model/companyList';
import type { SelectionStatus } from '@/features/companies/model/selection';
import { SelectionStepBadge } from '@/features/companies/ui/selection-step-badge';
import { DeleteIconButton } from '@/shared/button';
import { DragHandle } from '@/shared/DragHandle';
import { cn } from '@/lib/utils';

type CompanyPriorityCardProps = {
  company: CompanyListItem;
  showDelete?: boolean;
  canReorder?: boolean;
  dragValue?: string;
  onDragSessionStart?: (cancelDrag: () => void) => void;
  onDragSessionEnd?: () => void;
  onSelectionResultChange?: (
    companyId: number,
    result: SelectionStatus,
  ) => void;
};

export function CompanyListCard({
  company,
  showDelete = true,
  canReorder = false,
  dragValue,
  onDragSessionStart,
  onDragSessionEnd,
  onSelectionResultChange,
}: CompanyPriorityCardProps) {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const companyPath = `/companies/${company.id}`;

  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof Element && Boolean(target.closest('[data-card-action]'));

  const openCompany = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) return;

    navigate(companyPath);
  };

  const openCompanyFromKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    navigate(companyPath);
  };

  const card = (
    <article
      role="link"
      tabIndex={0}
      onClick={openCompany}
      onKeyDown={openCompanyFromKeyboard}
      className={cn(
        'cursor-pointer border border-[var(--line)] bg-[var(--panel-raised)] focus-visible:border-[var(--accent)] focus-visible:outline-none',
        'ui-panel-interactive group hover:border-[var(--line-strong)]',
      )}
      aria-label={`${company.name}の詳細を開く`}
    >
      <div className={cn('flex min-h-10 items-center gap-2 pl-3', !canReorder && 'pr-3')}>
        <span className="flex size-7 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
          <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>

        <span className="ml-2 min-w-0 flex-1 truncate text-sm font-bold text-[var(--text-strong)]">
          {company.name}
        </span>

        <span data-card-action className="inline-flex">
          <SelectionStepBadge
            title={company.selection.title}
            step={company.selection.step}
            result={company.selection.status}
            size="m"
            onResultChange={(result) => {
              onSelectionResultChange?.(company.id, result);
            }}
          />
        </span>

        {showDelete && (
          <span data-card-action className="inline-flex">
            <DeleteIconButton size="s" transparent={false} onClick={() => {}} />
          </span>
        )}

        {canReorder && (
          <DragHandle
            raised
            compact
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dragControls.start(event);
            }}
            label={`${company.name}を並べ替えて志望度を変更`}
            title="ドラッグして志望度を変更"
          />
        )}
      </div>
    </article>
  );

  if (!canReorder || !dragValue) {
    return card;
  }

  return (
    <Reorder.Item
      value={dragValue}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => onDragSessionStart?.(() => dragControls.cancel())}
      onDragEnd={onDragSessionEnd}
      layout="position"
      transition={{
        layout: {
          type: 'spring',
          stiffness: 420,
          damping: 34,
          mass: 0.75,
        },
      }}
      whileDrag={{
        x: 0,
        zIndex: 20,
      }}
      className="w-full list-none"
    >
      {card}
    </Reorder.Item>
  );
}
