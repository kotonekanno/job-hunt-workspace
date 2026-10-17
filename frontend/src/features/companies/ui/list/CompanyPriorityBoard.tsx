import { Archive } from 'lucide-react';
import { Reorder } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import type { SelectionStatus } from '@/api/generated/models/selectionStatus';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { CompanyPriority } from '@/api/generated/models/companyPriority';
import {
  listPriorities,
  listPriorityLabels,
  companyBoardIds,
  companiesFromBoard,
} from '@/features/companies/lib/companyBoard';
import { CompanyListCard } from '@/features/companies/ui/list/CompanyListCard';
import { useListDragSession } from '@/shared/useListDragSession';

type CompanyPriorityBoardProps = {
  companies: CompanyListItem[];
  onCompaniesReorder: (companies: CompanyListItem[]) => Promise<boolean>;
  onSelectionResultChange: (companyId: number, result: SelectionStatus) => void;
};

const initialPriorityOrder = listPriorities;

const priorityTextStyles: Record<CompanyPriority, string> = {
  1: 'text-[var(--accent)]',
  2: 'text-[var(--text-strong)]',
  3: 'text-[var(--text-strong)]',
  4: 'text-[var(--muted)]',
  5: 'text-[var(--faint)]',
  7: 'text-[var(--faint)] opacity-75',
  6: 'text-[var(--muted)]',
};

function getPriorityItemId(priority: CompanyPriority) {
  return `priority-${priority}`;
}

function getCompanyItemId(companyId: number) {
  return `company-${companyId}`;
}

export function CompanyPriorityBoard({
  companies,
  onCompaniesReorder,
  onSelectionResultChange,
}: CompanyPriorityBoardProps) {
  const priorityOrder = initialPriorityOrder;
  const { isDragSessionActive, startDragSession, endDragSession } =
    useListDragSession();

  const boardItemIds = useMemo(() => companyBoardIds(companies), [companies]);
  const [draftIds, setDraftIds] = useState<string[] | null>(null);
  const draft = useRef<string[] | null>(null);
  const active = useRef(false);
  const saving = useRef(false);
  const displayed = draftIds
    ? companiesFromBoard(draftIds, companies)
    : companies;

  function beginDrag(cancel: () => void) {
    if (saving.current) {
      cancel();
      return;
    }
    active.current = true;
    draft.current = boardItemIds;
    startDragSession(() => {
      active.current = false;
      draft.current = null;
      setDraftIds(null);
      cancel();
    });
  }
  function reorderBoard(ids: string[]) {
    if (!active.current) return;
    draft.current = ids;
    setDraftIds(ids);
  }
  async function drop() {
    if (!active.current) return;
    active.current = false;
    endDragSession();
    const ids = draft.current;
    if (!ids || ids.every((id, index) => id === boardItemIds[index])) {
      setDraftIds(null);
      return;
    }
    saving.current = true;
    try {
      await onCompaniesReorder(companiesFromBoard(ids, companies));
    } finally {
      saving.current = false;
      draft.current = null;
      setDraftIds(null);
    }
  }

  return (
    <>
      <Reorder.Group
        axis="y"
        values={draftIds ?? boardItemIds}
        onReorder={reorderBoard}
        data-drag-session={isDragSessionActive}
        className="w-full space-y-1 p-0"
      >
        {priorityOrder.flatMap((priority) => {
          const laneCompanies = displayed.filter(
            (company) => company.priority === priority,
          );

          return [
            <Reorder.Item
              key={getPriorityItemId(priority)}
              value={getPriorityItemId(priority)}
              dragListener={false}
              layout="position"
              transition={{
                layout: {
                  type: 'spring',
                  stiffness: 420,
                  damping: 34,
                  mass: 0.75,
                },
              }}
              className={`w-full list-none pt-3 first:pt-0 ${priority === 7 || priority === 6 ? 'pt-6' : ''}`}
            >
              <div
                className={`
                  flex min-h-9 w-full items-center
                  justify-between gap-4 border border-[var(--line)]
                  px-3 text-left
                  ${priorityTextStyles[priority]}
                `}
              >
                <div className="flex min-w-0 items-baseline gap-3">
                  <p className="shrink-0 font-mono text-[7px] tracking-[0.16em] opacity-60">
                    {priority === 7 ? (
                      <Archive aria-label="アーカイブ" className="size-4" />
                    ) : (
                      'PRIORITY'
                    )}
                  </p>

                  <h2 className="truncate text-sm font-black">
                    {listPriorityLabels[priority]}
                  </h2>
                </div>
              </div>
            </Reorder.Item>,

            ...laneCompanies.map((company) => (
              <CompanyListCard
                key={getCompanyItemId(company.id)}
                company={company}
                canReorder
                onDragSessionStart={beginDrag}
                onDragSessionEnd={drop}
                dragValue={getCompanyItemId(company.id)}
                onSelectionResultChange={onSelectionResultChange}
              />
            )),
          ];
        })}
      </Reorder.Group>
    </>
  );
}
