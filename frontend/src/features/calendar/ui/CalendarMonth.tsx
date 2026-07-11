import { MapPin, Pencil, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toDateKey, type CalendarDay } from "@/features/calendar/lib/calendar";
import type { CalendarEvent } from "@/features/calendar/model/calendar";

type CalendarMonthProps = { days: CalendarDay[]; events: CalendarEvent[]; onEdit: (event: CalendarEvent) => void };
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function getEventClassName(event: CalendarEvent): string {
  if (event.status !== "参加確定") return "border-dashed border-[var(--line-strong)] bg-transparent text-[var(--faint)] opacity-55";
  if (event.format === "オフライン") return "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--text-strong)] shadow-[0_2px_6px_var(--shadow)]";
  return "border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--text-strong)]";
}

export function CalendarMonth({ days, events, onEdit }: CalendarMonthProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const todayKey = toDateKey(new Date(2026, 6, 12));

  useEffect(() => {
    function closeEventDetails() {
      setSelectedEventId(null);
    }

    document.addEventListener("mousedown", closeEventDetails);
    return () => document.removeEventListener("mousedown", closeEventDetails);
  }, []);

  return (
    <div className="overflow-x-auto border border-[var(--line)] bg-[var(--panel)] shadow-[0_8px_28px_var(--shadow)] transition-colors duration-300">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--panel-raised)]">
          {weekdays.map((weekday, index) =>
            <div
              key={weekday}
              className={`
                px-2 py-2 text-center font-mono text-[10px] font-semibold
                ${index === 0
                  ? "text-rose-500"
                  : index === 6
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)]"
                }
              `}
            >
              {weekday}
            </div>
          )}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={day.dateKey}
              className={`
                min-h-24 border-r border-b border-[var(--line)] p-1.5 transition-colors hover:bg-[var(--panel-raised)]
                ${(index + 1) % 7 === 0 ? "border-r-0" : ""}
                ${!day.isCurrentMonth ? "opacity-35" : ""}
              `}
            >
              <span
                className={`
                  flex size-6 items-center justify-center text-[10px] font-semibold
                  ${day.dateKey === todayKey
                    ? "cyber-cut-sm bg-[var(--accent)] text-[var(--accent-contrast)]"
                    : "text-[var(--muted)]"
                  }
                `}
              >
                {day.date.getDate()}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {events.filter((event) => event.date === day.dateKey).map((event) => {
                  const isSelected = selectedEventId === event.id;
                  return (
                    <CalendarEventDialog
                      event={event}
                      isSelected={isSelected}
                      setSelectedEventId={setSelectedEventId}
                      onEdit={onEdit}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type CalendarEventDialogProps = {
  event: CalendarEvent;
  isSelected: boolean;
  setSelectedEventId: any;
  onEdit: (event: CalendarEvent) => void;
}

function CalendarEventDialog({ event, isSelected, setSelectedEventId, onEdit }: CalendarEventDialogProps) {
  return (
    <div key={event.id} className="group relative">

      <button
        type="button"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        onClick={() => setSelectedEventId(isSelected ? null : event.id)}
        className={`block h-5 w-full border-l-2 px-1.5 text-left transition-all hover:translate-x-0.5 ${getEventClassName(event)}`}
        aria-expanded={isSelected}
      >
        <span className="flex min-w-0 items-center gap-1">
        <span className="shrink-0 font-mono text-[8px] opacity-75">{event.time}</span>
        <span className="truncate text-[9px] font-bold">{event.company}</span></span>
      </button>

      <div
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        onClick={() => setSelectedEventId(event.id)}
        className={`
          absolute top-[calc(100%+2px)] left-0 z-30 w-52 cursor-default
          border border-[var(--line-strong)] bg-[var(--panel)]
          p-3 text-left shadow-[0_10px_28px_var(--shadow)]
          ${isSelected ? "block" : "hidden group-hover:block"}
        `}
      >
        <p className="text-xs font-bold text-[var(--text-strong)]">{event.company}</p>
        <p className="mt-1 text-[10px] text-[var(--muted)]">{event.title}</p>
        <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-[var(--faint)]">
          <span className="border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-1 text-[11px] font-bold text-[var(--accent)]">
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            {event.format === "オンライン"
              ? <Video className="size-3" />
              : <MapPin className="size-3" />
            }
            {event.location}
          </span>
        </div>
        <p className="mt-2 border-t border-[var(--line)] pt-2 text-[9px] font-semibold text-[var(--accent)]">{event.status}</p>
        {event.memo && (
          <p className="mt-2 border-l-2 border-[var(--line-strong)] pl-2 text-[9px] leading-relaxed text-[var(--muted)]">{event.memo}</p>
        )}
        <button
          type="button"
          onClick={() => onEdit(event)}
          className="mt-3 flex w-full items-center justify-center gap-1 border border-[var(--line)] py-1.5 text-[9px] font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <Pencil className="size-3" />
          予定を編集
        </button>
      </div>

    </div>
  );
}