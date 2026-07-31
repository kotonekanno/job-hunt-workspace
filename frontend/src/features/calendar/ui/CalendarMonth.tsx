import { toDateKey, type CalendarDay } from "@/features/calendar/lib/calendar";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { CalendarEventItem } from "@/features/calendar/ui/CalendarEventItem";

type CalendarMonthProps = {
  days: CalendarDay[];
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: number) => void;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function occursOnDate(
  event: CalendarEvent,
  dateKey: string,
) {
  if (!event.allDay) {
    return event.date === dateKey;
  }

  return event.date <= dateKey
    && (event.endDate ?? event.date) >= dateKey;
}

export function CalendarMonth({
  days,
  events,
  onEdit,
  onDelete,
}: CalendarMonthProps) {
  const todayKey = toDateKey(new Date(2026, 6, 12));

  return (
    <div className="overflow-x-auto border border-[var(--line)] bg-[var(--panel)] shadow-[0_8px_28px_var(--shadow)] transition-colors duration-300">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--panel-raised)]">
          {weekdays.map((weekday, index) => (
            <div
              key={weekday}
              className={`
                px-2 py-2 text-center font-mono text-[10px] font-semibold
                ${
                  index === 0
                    ? "text-rose-500"
                    : index === 6
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted)]"
                }
              `}
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={day.dateKey}
              className={`
                min-h-24 min-w-0 border-r border-b border-[var(--line)] p-1.5
                transition-colors hover:bg-[var(--panel-raised)]
                ${(index + 1) % 7 === 0 ? "border-r-0" : ""}
                ${!day.isCurrentMonth ? "opacity-35" : ""}
              `}
            >
              <span
                className={`
                  flex size-6 items-center justify-center text-[10px] font-semibold
                  ${
                    day.dateKey === todayKey
                      ? "cyber-cut-sm bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "text-[var(--muted)]"
                  }
                `}
              >
                {day.date.getDate()}
              </span>

              <div className="mt-0.5 min-w-0 space-y-0.5 overflow-hidden">
                {events
                  .filter((event) => occursOnDate(event, day.dateKey))
                  .map((event) => (
                    <CalendarEventItem
                      key={event.id}
                      event={event}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
