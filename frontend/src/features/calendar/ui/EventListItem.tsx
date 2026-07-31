import {
  ChevronDown,
  MapPin,
  Video,
} from "lucide-react";
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
  if (event.status === "不参加") {
    return "border-l-[var(--line-strong)] opacity-55";
  }

  return "border-l-[var(--accent)]";
}

export function EventListItem({
  event,
  onEdit,
  onDelete,
  showCompany = true,
}: EventListItemProps) {
  const FormatIcon = event.format === "オンライン"
    ? Video
    : MapPin;

  return (
    <details
      className={`ui-panel-interactive group border border-[var(--line)] border-l-[3px] bg-[var(--panel-raised)] shadow-[0_3px_12px_var(--shadow)] open:border-[var(--line-strong)] ${getEventEmphasisClassName(event)}`}
    >
      <summary className="event-list-summary flex min-h-16 cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <div className="event-list-schedule flex w-[112px] shrink-0 items-stretch border-r border-[var(--line)] pr-3">
          <div className="flex w-12 shrink-0 items-center justify-center border-r border-[var(--line)] pr-2">
            <p className="font-mono text-xs font-bold text-[var(--text-strong)]">
              {event.date.slice(5).replace("-", "/")}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center pl-2 font-mono">
            {event.allDay ? (
              <>
                <span className="text-[10px] font-black text-[var(--accent)]">
                  終日
                </span>

                {event.endDate && event.endDate !== event.date && (
                  <span className="mt-0.5 text-[8px] font-semibold text-[var(--muted)]">
                    → {event.endDate.slice(5).replace("-", "/")}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-[10px] font-black text-[var(--accent)]">
                  {event.startTime ?? "--:--"}
                </span>

                <span className="mt-0.5 text-[10px] font-bold text-[var(--muted)]">
                  {event.endTime ?? "--:--"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {showCompany && (
            <p className="truncate text-[10px] text-[var(--muted)]">
              {event.company}
            </p>
          )}

          <h3 className={`truncate text-xs font-bold text-[var(--text-strong)] ${showCompany ? "mt-1" : ""}`}>
            {event.title}
          </h3>
        </div>

        <span
          title={event.format}
          aria-label={event.format}
          className="flex size-7 shrink-0 items-center justify-center bg-[var(--panel)] text-[var(--accent)]"
        >
          <FormatIcon className="size-3.5" />
        </span>

        <div className="flex shrink-0 items-center gap-2">
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
        </div>

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
