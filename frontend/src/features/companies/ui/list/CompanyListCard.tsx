import {
  FileText
} from "lucide-react";
import type {
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  SetStateAction,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import type {
  CompanyListItem,
} from "@/features/companies/model/companyList";
import {
  priorityLabels,
  priorityStyle,
} from "@/features/companies/model/companyPriorityPresentation";
import { SelectionStepBadgeForCard } from "../selection-step-badge";
import { PriorityBadge } from "../priority-badge";
import { DeleteIconButton } from "@/shared/button";

type CompanyPriorityCardProps = {
  company: CompanyListItem;
  selectedEventId: number | null;
  setSelectedEventId: Dispatch<SetStateAction<number | null>>;
  onEditEvent: (event: CalendarEvent) => void;
};

export function CompanyListCard({
  company
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

        <Link
          data-card-action
          to={`/companies/${company.id}/documents`}
          className="
            flex h-7 shrink-0 cursor-pointer items-center gap-1.5
            border border-[var(--accent)] bg-[var(--accent-soft)]
            px-2.5 text-[9px] font-bold text-[var(--accent)] transition-colors
            hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]
          "
          aria-label={`${company.name}の文書を開く`}
        >
          <FileText className="size-3.5" />
        </Link>

        <DeleteIconButton
          size="s"
          onClick={() => {}}
        />
      </div>

    </article>
  );
}
