import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { EventDetails } from "@/features/calendar/ui/EventDetails";
import { HoverCard } from "@/shared/hover-card";

type CalendarEventItemProps = {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: number) => void;
};

function getEventClassName(event: CalendarEvent): string {
  if (event.status !== "参加確定") {
    return "border-dashed border-[var(--line-strong)] bg-transparent text-[var(--faint)] opacity-55";
  }

  if (event.format === "オフライン") {
    return "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--text-strong)] shadow-[0_2px_6px_var(--shadow)]";
  }

  return "border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--text-strong)]";
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
              {event.time}
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
        showLocation
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </HoverCard>
  );
}
