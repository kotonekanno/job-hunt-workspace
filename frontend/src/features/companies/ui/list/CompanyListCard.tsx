import type {
  KeyboardEvent,
  MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type {
  CompanyListItem,
  CompanyPriority,
} from "@/features/companies/model/companyList";
import { PriorityBadge } from "@/features/companies/ui/priority-badge";
import { SelectionStepBadgeForCard } from "@/features/companies/ui/selection-step-badge";
import {
  DeleteIconButton,
} from "@/shared/button";

type CompanyPriorityCardProps = {
  company: CompanyListItem;
  onPriorityChange?: (
    companyId: number,
    priority: CompanyPriority,
  ) => void;
  showDelete?: boolean;
};

export function CompanyListCard({
  company,
  onPriorityChange,
  showDelete = true,
}: CompanyPriorityCardProps) {
  const navigate = useNavigate();
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

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openCompany}
      onKeyDown={openCompanyFromKeyboard}
      className="group cursor-pointer border border-[var(--line)] bg-[var(--panel-raised)] p-3 transition-all hover:border-[var(--accent)] hover:shadow-[0_6px_16px_var(--shadow)] focus-visible:border-[var(--accent)] focus-visible:outline-none"
      aria-label={`${company.name}の詳細を開く`}
    >
      <div className="flex items-center gap-2">

        <span data-card-action className="inline-flex">
          <PriorityBadge
            priority={company.priority}
            size="s"
            onChange={(priority) => {
              onPriorityChange?.(
                company.id,
                (priority ?? 0) as CompanyPriority,
              );
            }}
          />
        </span>

        <span className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--text-strong)] group-hover:text-[var(--accent)] ml-2">
          {company.name}
        </span>

        <span data-card-action className="inline-flex">
          <SelectionStepBadgeForCard
            title="本選考"
            step="最終面接"
            result="pending"
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
      </div>

    </article>
  );
}
