import { ChevronDown } from "lucide-react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { EventDeleteButton } from "@/features/calendar/ui/EventDeleteButton";
import { EventDetails } from "@/features/calendar/ui/EventDetails";
import { EditIconButton } from "@/shared/button";

type EventListItemProps = {
  event: CalendarEvent;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: number) => void;
  showCompany?: boolean;
};

function getEventEmphasisClassName(event: CalendarEvent): string {
  if (event.status !== "参加確定") {
    return "border-l-[var(--line-strong)] bg-[var(--panel-raised)] opacity-80";
  }

  if (event.format === "オンライン") {
    return "border-l-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_3px_12px_var(--shadow)]";
  }

  return "border-l-[var(--line-strong)] bg-[var(--panel-raised)]";
}

export function EventListItem({
  event,
  onEdit,
  onDelete,
  showCompany = true,
}: EventListItemProps) {
  const columnsClassName = onEdit && onDelete
    ? "grid-cols-[58px_minmax(0,1fr)_28px_28px_16px]"
    : onEdit || onDelete
      ? "grid-cols-[58px_minmax(0,1fr)_28px_16px]"
      : "grid-cols-[58px_minmax(0,1fr)_16px]";

  return (
    <details
      className={`group border border-[var(--line)] border-l-[3px] transition-[border-color,box-shadow] duration-200 open:border-[var(--line-strong)] hover:border-y-[var(--line-strong)] hover:border-r-[var(--line-strong)] hover:shadow-[0_5px_16px_var(--shadow)] ${getEventEmphasisClassName(event)}`}
    >
      <summary
        className={`grid min-h-16 cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden ${columnsClassName}`}
      >
        <div className="border-r border-[var(--line)] pr-3 text-center">
          <p className="font-mono text-xs font-bold text-[var(--text-strong)]">
            {event.date.slice(5).replace("-", "/")}
          </p>
          <p className="mt-1 font-mono text-xs font-black text-[var(--accent)]">
            {event.time}
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-xs font-bold text-[var(--text-strong)]">
            {showCompany ? event.company : event.title}
          </h3>
          {showCompany && (
            <p className="mt-1 truncate text-[11px] text-[var(--text)]">
              {event.title}
            </p>
          )}
        </div>

        {onEdit && (
          <EditIconButton
            size="s"
            transparent={false}
            ariaLabel={`${event.title}を編集`}
            onClick={(clickEvent) => {
              clickEvent.preventDefault();
              clickEvent.stopPropagation();
              onEdit(event);
            }}
          />
        )}

        {onDelete && (
          <EventDeleteButton
            event={event}
            size="s"
            onDelete={onDelete}
            stopPropagation
          />
        )}

        <ChevronDown className="size-4 shrink-0 text-[var(--faint)] transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="border-t border-[var(--line)] bg-[var(--panel)] px-4 py-3">
        <EventDetails
          event={event}
          size="m"
          showHeading={false}
        />
      </div>
    </details>
  );
}
