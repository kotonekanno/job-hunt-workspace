import { HoverCard } from '@/shared/hover-card';
import { ArrowUpRight, Minus } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CompanyListItem } from '@/features/companies/model/companyList';
import type { SelectionStatus } from '@/api/generated/models';
import { SelectionStepBadge } from '@/features/companies/ui/selection-step-badge';
import { DragHandle } from '@/shared/DragHandle';
import { cn } from '@/lib/utils';

type CompanyPriorityCardProps = {
  company: CompanyListItem;
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
  canReorder = false,
  dragValue,
  onDragSessionStart,
  onDragSessionEnd,
  onSelectionResultChange,
}: CompanyPriorityCardProps) {
  const navigate = useNavigate();
  const latest = company.priority === 7 ? null : company.latestActivity;
  const selection = company.priority === 7 ? null : company.currentSelection;
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
      <div
        className={cn(
          'flex min-h-10 items-center gap-2 pl-3',
          !canReorder && 'pr-3',
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>

        <span className="ml-2 min-w-0 flex-1 truncate text-sm font-bold text-[var(--text-strong)]">
          {company.name}
        </span>

        {latest && (
          <div
            data-card-action
            className="min-w-0 max-w-[35%]"
            onClick={(event) => event.stopPropagation()}
          >
            <HoverCard
              openOnHover={false}
              placement="bottom-end"
              sizeClassName="w-[420px] max-w-[calc(100vw-2rem)]"
              triggerClassName="block min-w-0 cursor-pointer"
              trigger={
                <span className="block truncate rounded-xl rounded-tl-none border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-[11px] text-[var(--text)] transition-colors hover:bg-[color-mix(in_srgb,var(--panel),var(--accent)_8%)]">
                  {latest}
                </span>
              }
            >
              <p className="whitespace-pre-wrap text-sm text-[var(--text)]">
                {latest}
              </p>
            </HoverCard>
          </div>
        )}
        {company.priority !== 7 && (
          <span data-card-action className="inline-flex">
            {selection?.step ? (
              <SelectionStepBadge
                title={selection.title}
                step={selection.step.name}
                result={selection.step.status}
                size="m"
                onResultChange={(result) => {
                  onSelectionResultChange?.(company.id, result);
                }}
              />
            ) : (
              <span
                aria-label="進行中の選考なし"
                className="flex h-7 w-20 cursor-default items-center justify-center border border-[var(--line)] bg-[var(--panel)] text-[var(--faint)]"
              >
                <Minus aria-hidden="true" className="size-4" />
              </span>
            )}
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
