import {
  ArrowUpRight,
  GripVertical,
} from "lucide-react";
import {
  Reorder,
  useDragControls,
} from "motion/react";
import type {
  KeyboardEvent,
  MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type { CompanyListItem } from "@/features/companies/model/companyList";
import type { SelectionResult } from "@/features/companies/model/companyDetail";
import { SelectionStepBadge } from "@/features/companies/ui/selection-step-badge";
import {
  DeleteIconButton,
} from "@/shared/button";

type CompanyPriorityCardProps = {
  company: CompanyListItem;
  showDelete?: boolean;
  canReorder?: boolean;
  dragValue?: string;
  onSelectionResultChange?: (
    companyId: number,
    result: SelectionResult,
  ) => void;
};

export function CompanyListCard({
  company,
  showDelete = true,
  canReorder = false,
  dragValue,
  onSelectionResultChange,
}: CompanyPriorityCardProps) {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const companyPath = `/companies/${company.id}`;

  const isInteractiveTarget = (target: EventTarget | null) => (
    target instanceof Element
    && Boolean(target.closest("[data-card-action]"))
  );

  const openCompany = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) return;

    navigate(companyPath);
  };

  const openCompanyFromKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    navigate(companyPath);
  };

  const card = (
    <article
      role="link"
      tabIndex={0}
      onClick={openCompany}
      onKeyDown={openCompanyFromKeyboard}
      className="group cursor-pointer border border-[var(--line)] bg-[var(--panel-raised)] px-3 py-1.5 transition-all hover:border-[var(--accent)] hover:shadow-[0_4px_12px_var(--shadow)] focus-visible:border-[var(--accent)] focus-visible:outline-none"
      aria-label={`${company.name}の詳細を開く`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
          <ArrowUpRight
            aria-hidden="true"
            className="size-4"
          />
        </span>

        <span className="ml-2 min-w-0 flex-1 truncate text-sm font-bold text-[var(--text-strong)] group-hover:text-[var(--accent)]">
          {company.name}
        </span>

        <span data-card-action className="inline-flex">
          <SelectionStepBadge
            title={company.selectionType}
            step={company.currentStep}
            result={company.selectionResult}
            size="m"
            onResultChange={(result) => {
              onSelectionResultChange?.(company.id, result);
            }}
          />
        </span>

        {showDelete && (
          <span data-card-action className="inline-flex">
            <DeleteIconButton
              size="s"
              transparent={false}
              onClick={() => {}}
            />
          </span>
        )}

        {canReorder && (
          <button
            type="button"
            data-card-action
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dragControls.start(event);
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            className="flex size-7 shrink-0 touch-none cursor-grab items-center justify-center text-[var(--faint)] transition-colors hover:text-[var(--accent)] active:cursor-grabbing"
            aria-label={`${company.name}を並べ替えて志望度を変更`}
            title="ドラッグして志望度を変更"
          >
            <GripVertical className="size-4" />
          </button>
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
      layout="position"
      transition={{
        layout: {
          type: "spring",
          stiffness: 420,
          damping: 34,
          mass: 0.75,
        },
      }}
      whileDrag={{
        x: 0,
        zIndex: 20,
        boxShadow: "0 16px 36px var(--shadow)",
      }}
      className="w-full list-none"
    >
      {card}
    </Reorder.Item>
  );
}
