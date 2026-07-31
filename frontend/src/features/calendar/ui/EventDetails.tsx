import {
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
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: number) => void;
};

const sizeStyles = {
  s: {
    headingGap: "gap-2",
    time: "w-12 text-[11px]",
    company: "text-xs",
    title: "text-[10px]",
    contentGap: "mt-2.5",
    memo: "text-[10px] leading-5",
  },
  m: {
    headingGap: "gap-2.5",
    time: "w-14 text-xs",
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
  onEdit,
  onDelete,
}: EventDetailsProps) {
  const styles = sizeStyles[size];
  const FormatIcon = event.isOnline
    ? Video
    : MapPin;

  return (
    <div>
      {showHeading && (
        <div className={`flex items-center ${styles.headingGap}`}>
          <time
            className={`flex shrink-0 flex-col justify-center border-r border-[var(--line)] pr-2.5 font-mono ${styles.time}`}
          >
            {event.isAllDay ? (
              <>
                <span className="font-black text-[var(--accent)]">
                  終日
                </span>

                {event.endDate !== event.startDate && (
                  <span className="mt-1 text-[9px] font-semibold text-[var(--muted)]">
                    → {event.endDate.slice(5).replace("-", "/")}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="font-black text-[var(--accent)]">
                  {event.startTime ?? "--:--"}
                </span>

                <span className="mt-1 font-semibold text-[var(--muted)]">
                  {event.endTime ?? "--:--"}
                </span>
              </>
            )}
          </time>

          <div className="min-w-0 flex-1">
            {showCompany && (
              <p
                className={`truncate text-[var(--muted)] ${styles.title}`}
              >
                {event.company}
              </p>
            )}

            <h3
              className={`truncate font-bold text-[var(--text-strong)] ${showCompany ? "mt-0.5" : ""} ${styles.company}`}
            >
              {event.title}
            </h3>
          </div>

          <span
            title={event.isOnline ? "オンライン" : "オフライン"}
            aria-label={event.isOnline ? "オンライン" : "オフライン"}
            className="flex size-7 shrink-0 items-center justify-center bg-[var(--panel-raised)] text-[var(--accent)]"
          >
            <FormatIcon className="size-3.5" />
          </span>
        </div>
      )}

      <div className={styles.contentGap}>
        <p className={`text-[var(--text)] ${styles.memo}`}>
          {event.note || "メモはありません"}
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
