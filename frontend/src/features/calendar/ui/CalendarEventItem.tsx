import type {
  CalendarEvent,
  EventCategory,
} from "@/features/calendar/model/calendar";
import { getEventStartTimeLabel } from "@/features/calendar/lib/eventTime";
import { EventDetails } from "@/features/calendar/ui/EventDetails";
import { HoverCard } from "@/shared/hover-card";

type CalendarEventItemProps = {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: number) => void;
};

const categoryColorClassName: Record<EventCategory, string> = {
  session: "border-sky-500 bg-sky-500/10 text-[var(--text-strong)]",
  interview: "border-rose-500 bg-rose-500/10 text-[var(--text-strong)]",
  chat: "border-yellow-500 bg-yellow-500/10 text-[var(--text-strong)]",
  internship: "border-purple-500 bg-purple-500/10 text-[var(--text-strong)]",
  other: "border-slate-500 bg-slate-500/10 text-[var(--text-strong)]",
};

function getEventClassName(event: CalendarEvent): string {
  const emphasisClassName = event.isAttending === false
    ? "bg-transparent opacity-50 shadow-none"
    : "font-semibold shadow-[0_2px_6px_var(--shadow)]";

  return `${categoryColorClassName[event.category]} ${emphasisClassName}`;
}

export function CalendarEventItem({
  event,
  onEdit,
  onDelete,
}: CalendarEventItemProps) {
  return (
    <HoverCard
      sizeClassName="w-64"
      triggerClassName="block w-full min-w-0"
      trigger={
        <button
          type="button"
          className={`
            block h-5 w-full min-w-0 max-w-full cursor-pointer overflow-hidden
            border-l-2 px-1.5 text-left transition-[filter,box-shadow]
            hover:brightness-105 hover:shadow-[0_2px_5px_var(--shadow)]
            ${getEventClassName(event)}
          `}
        >
          <span className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-1 overflow-hidden">
            <span className="shrink-0 font-mono text-[8px] opacity-75">
              {getEventStartTimeLabel(event)}
            </span>

            <span className="truncate text-[9px] font-bold">
              {event.company}
            </span>
          </span>
        </button>
      }
    >
      <EventDetails
        event={event}
        size="s"
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </HoverCard>
  );
}
