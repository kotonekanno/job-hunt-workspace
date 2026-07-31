import { Reorder } from "motion/react";
import {
  useMemo,
} from "react";
import type { SelectionStatus } from "@/features/companies/model/selection";
import {
  priorities,
  secondaryPriorities,
  type CompanyListItem,
  type CompanyPriority,
} from "@/features/companies/model/companyList";
import { priorityLabels } from "@/features/companies/model/companyPriorityPresentation";
import { CompanyListCard } from "@/features/companies/ui/list/CompanyListCard";

type CompanyPriorityBoardProps = {
  companies: CompanyListItem[];
  onCompaniesReorder: (
    orderedIds: number[],
    priorityChanges: Array<{
      companyId: number;
      priority: CompanyPriority;
    }>,
  ) => void;
  onSelectionResultChange: (
    companyId: number,
    result: SelectionStatus,
  ) => void;
};

const initialPriorityOrder = [
  ...priorities,
  ...secondaryPriorities,
];

const priorityTextStyles: Record<CompanyPriority, string> = {
  1: "text-[var(--accent)]",
  2: "text-[var(--text-strong)]",
  3: "text-[var(--text-strong)]",
  4: "text-[var(--muted)]",
  5: "text-[var(--faint)]",
  6: "text-[var(--faint)] opacity-75",
  0: "text-[var(--muted)]",
};

function getPriorityItemId(priority: CompanyPriority) {
  return `priority-${priority}`;
}

function getCompanyItemId(companyId: number) {
  return `company-${companyId}`;
}

function getPriorityFromItemId(
  itemId: string,
): CompanyPriority | undefined {
  if (!itemId.startsWith("priority-")) {
    return undefined;
  }

  return Number(itemId.replace("priority-", "")) as CompanyPriority;
}

function getCompanyIdFromItemId(
  itemId: string,
): number | undefined {
  if (!itemId.startsWith("company-")) {
    return undefined;
  }

  return Number(itemId.replace("company-", ""));
}

export function CompanyPriorityBoard({
  companies,
  onCompaniesReorder,
  onSelectionResultChange,
}: CompanyPriorityBoardProps) {
  const priorityOrder = initialPriorityOrder;

  const boardItemIds = useMemo(
    () => priorityOrder.flatMap((priority) => [
      getPriorityItemId(priority),
      ...companies
          .filter((company) => company.priority === priority)
          .map((company) => getCompanyItemId(company.id)),
    ]),
    [companies, priorityOrder],
  );

  function reorderBoard(orderedItemIds: string[]) {
    let currentPriority: CompanyPriority | undefined;
    const orderedCompanyIds: number[] = [];
    const priorityChanges: Array<{
      companyId: number;
      priority: CompanyPriority;
    }> = [];

    orderedItemIds.forEach((itemId) => {
      const priority = getPriorityFromItemId(itemId);

      if (priority !== undefined) {
        currentPriority = priority;
        return;
      }

      const companyId = getCompanyIdFromItemId(itemId);

      if (companyId === undefined) {
        return;
      }

      orderedCompanyIds.push(companyId);

      if (currentPriority !== undefined) {
        priorityChanges.push({
          companyId,
          priority: currentPriority,
        });
      }
    });

    onCompaniesReorder(orderedCompanyIds, priorityChanges);
  }

  return (
    <>
      <Reorder.Group
        axis="y"
        values={boardItemIds}
        onReorder={reorderBoard}
        className="w-full space-y-1 p-0"
      >
        {priorityOrder.flatMap((priority) => {
          const laneCompanies = companies
            .filter((company) => company.priority === priority)
            .sort((left, right) => left.order - right.order);

          return [
            <Reorder.Item
              key={getPriorityItemId(priority)}
              value={getPriorityItemId(priority)}
              dragListener={false}
              layout="position"
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                  mass: 0.75,
                },
              }}
              className={`w-full list-none pt-3 first:pt-0 ${priority === 6 || priority === 0 ? "pt-6" : ""}`}
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
                    PRIORITY
                  </p>

                  <h2 className="truncate text-sm font-black">
                    {priorityLabels[priority]}
                  </h2>
                </div>

              </div>
            </Reorder.Item>,

            ...laneCompanies.map((company) => (
              <CompanyListCard
                key={getCompanyItemId(company.id)}
                company={company}
                canReorder
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
