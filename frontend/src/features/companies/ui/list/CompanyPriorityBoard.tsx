import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { EventDialog } from "@/features/calendar/ui/EventDialog";
import {
  priorities,
  secondaryPriorities,
  type CompanyListItem,
  type CompanyPriority,
} from "@/features/companies/model/companyList";
import { CompanyListCard } from "@/features/companies/ui/list/CompanyListCard";
import {
  priorityLabels,
  priorityStyle,
} from "@/features/companies/model/companyPriorityPresentation";

type CompanyPriorityBoardProps = {
  companies: CompanyListItem[];
  onEventChange: (
    companyId: number,
    event: CalendarEvent,
  ) => void;
  onPriorityChange: (
    companyId: number,
    priority: CompanyPriority,
  ) => void;
};

export function CompanyPriorityBoard({
  companies,
  onEventChange,
  onPriorityChange,
}: CompanyPriorityBoardProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent>();
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [collapsedPriorities, setCollapsedPriorities] = useState<
    Set<CompanyPriority>
  >(() => new Set([4, 5, 6]));

  useEffect(() => {
    const closeEventDetail = () => setSelectedEventId(null);

    document.addEventListener("mousedown", closeEventDetail);

    return () => document.removeEventListener("mousedown", closeEventDetail);
  }, []);

  const openEventEditor = (event: CalendarEvent) => {
    const company = companies.find((item) => item.nextEvent?.id === event.id);

    if (!company) return;

    setEditingEvent(event);
    setEditingCompanyId(company.id);
  };

  const togglePriority = (priority: CompanyPriority) => {
    setCollapsedPriorities((current) => {
      const next = new Set(current);

      if (next.has(priority)) {
        next.delete(priority);
      } else {
        next.add(priority);
      }

      return next;
    });
  };

  const changePriority = (
    companyId: number,
    priority: CompanyPriority,
  ) => {
    setCollapsedPriorities((current) => {
      const next = new Set(current);
      next.delete(priority);

      return next;
    });

    onPriorityChange(companyId, priority);
  };

  return (
    <div className="space-y-3">
      {[...priorities, ...secondaryPriorities].map((priority) => {
        const laneCompanies = companies.filter(
          (company) => company.priority === priority,
        );
        const isCollapsed = collapsedPriorities.has(priority);

        if (laneCompanies.length === 0) return null;

        return (
          <section
            key={priority}
            className={`border border-[var(--line)] bg-[var(--panel)] shadow-[0_5px_18px_var(--shadow)] ${priority === 0 ? "mt-10 border-t-2 border-t-[var(--line-strong)]" : ""} ${priority === 6 ? "opacity-80" : ""}`}
          >
            <button
              type="button"
              onClick={() => togglePriority(priority)}
              className={`flex w-full cursor-pointer items-center justify-between gap-4 border-b px-4 py-3 text-left ${priorityStyle[priority]}`}
              aria-expanded={!isCollapsed}
              aria-label={`${priorityLabels[priority]}を${isCollapsed ? "開く" : "閉じる"}`}
            >
              <div className="flex items-center gap-3">
                <p className="font-mono text-[8px] tracking-[0.18em] opacity-70">
                  PRIORITY
                </p>
                <span className="h-4 w-px bg-current opacity-30" />
                <h2 className="text-lg font-black">
                  {priorityLabels[priority]}
                </h2>
              </div>

              <ChevronDown
                className={`size-4 shrink-0 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
              />
            </button>

            {!isCollapsed && (
              <div className="grid gap-2 p-3 lg:grid-cols-2">
                {laneCompanies.map((company) => (
                  <CompanyListCard
                    key={company.id}
                    company={company}
                    onPriorityChange={changePriority}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {editingEvent && editingCompanyId !== null && (
        <EventDialog
          event={editingEvent}
          onClose={() => {
            setEditingEvent(undefined);
            setEditingCompanyId(null);
          }}
          onSave={(event, id) => {
            onEventChange(editingCompanyId, {
              ...event,
              id: id ?? editingEvent.id,
            });
          }}
        />
      )}
    </div>
  );
}
