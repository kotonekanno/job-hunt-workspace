import {
  CheckCircle2,
  CircleHelp,
  MapPin,
  Video,
} from "lucide-react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { EventDeleteButton } from "@/features/calendar/ui/EventDeleteButton";
import { EditIconButton } from "@/shared/button";

type EventDetailsSize = "s" | "m";

type EventDetailsProps = {
  event: CalendarEvent;
  size: EventDetailsSize;
  showHeading?: boolean;
  showCompany?: boolean;
  showLocation?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: number) => void;
};

const sizeStyles = {
  s: {
    headingGap: "gap-2.5",
    time: "w-12 text-sm",
    company: "text-xs",
    title: "text-[10px]",
    contentGap: "mt-2.5",
    memo: "text-[10px] leading-5",
  },
  m: {
    headingGap: "gap-3",
    time: "w-14 text-base",
    company: "text-sm",
    title: "text-[11px]",
    contentGap: "mt-3",
    memo: "text-[11px] leading-5",
  },
} satisfies Record<EventDetailsSize, Record<string, string>>;

export function EventDetails({
  event,
  size,
  showHeading = true,
  showCompany = true,
  showLocation = false,
  onEdit,
  onDelete,
}: EventDetailsProps) {
  const styles = sizeStyles[size];
  const isConfirmed = event.status === "参加確定";

  return (
    <div>
      {showHeading && (
        <div className={`flex items-center ${styles.headingGap}`}>
          <time
            className={`shrink-0 border-r border-[var(--line)] pr-2.5 font-mono font-black text-[var(--accent)] ${styles.time}`}
          >
            {event.time}
          </time>

          <div className="min-w-0 flex-1">
            {showCompany && (
              <h3
                className={`truncate font-bold text-[var(--text-strong)] ${styles.company}`}
              >
                {event.company}
              </h3>
            )}

            <p
              className={`truncate text-[var(--muted)] ${showCompany ? "mt-0.5" : "font-bold text-[var(--text-strong)]"} ${styles.title}`}
            >
              {event.title}
            </p>
          </div>

        </div>
      )}

      <div
        className={`flex flex-wrap items-center gap-2 ${
          showHeading ? styles.contentGap : ""
        }`}
      >
        <span className="inline-flex items-center gap-1.5 border border-[var(--line)] bg-[var(--panel-raised)] px-2 py-1 text-[9px] font-semibold text-[var(--muted)]">
          {event.format === "オンライン" ? (
            <Video className="size-3 text-[var(--accent)]" />
          ) : (
            <MapPin className="size-3 text-[var(--accent)]" />
          )}
          {showLocation ? event.location : event.format}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-semibold ${
            isConfirmed
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--line)] bg-[var(--panel-raised)] text-[var(--faint)]"
          }`}
        >
          {isConfirmed ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <CircleHelp className="size-3" />
          )}
          {event.status}
        </span>
      </div>

      <div
        className={`${styles.contentGap} border-l-2 border-[var(--accent-soft)] pl-3`}
      >
        <p className={`text-[var(--muted)] ${styles.memo}`}>
          {event.memo || "メモはありません"}
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div
          className={`${styles.contentGap} flex justify-end gap-2 border-t border-[var(--line)] pt-3`}
        >
          {onEdit && (
            <EditIconButton
              size="s"
              transparent={false}
              ariaLabel={`${event.title}を編集`}
              onClick={() => onEdit(event)}
            />
          )}

          {onDelete && (
            <EventDeleteButton
              event={event}
              size="s"
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}
