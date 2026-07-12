import {
  MapPin,
  Pencil,
  Video,
} from "lucide-react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";

type UpcomingEventsProps = {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
};

export function UpcomingEvents({ events, onEdit }: UpcomingEventsProps) {
  const upcomingEvents = [...events].filter((event) => event.date >= "2026-07-12").sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`)).slice(0, 4);
  return (
    <aside className="cyber-cut border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_8px_28px_var(--shadow)] transition-colors duration-300">
      <div className="flex items-end justify-between border-b border-[var(--line)] pb-3">
        <div><p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">// UPCOMING</p><h2 className="mt-0.5 text-sm font-bold text-[var(--text-strong)]">直近の予定</h2></div>
        <span className="font-mono text-[9px] text-[var(--faint)]">{upcomingEvents.length} EVENTS</span>
      </div>
      <div className="mt-2 space-y-2">
        {upcomingEvents.length === 0 && <p className="py-6 text-center text-xs text-[var(--faint)]">該当する予定はありません</p>}
        {upcomingEvents.map((event) => (
          <EventListItem key={event.id} event={event} onEdit={onEdit} />
        ))}
      </div>
    </aside>
  );
};

type UpcomingEventProps = {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  showCompany?: boolean;
}

export function EventListItem({
  event,
  onEdit,
  showCompany = true,
}: UpcomingEventProps) {
  const isConfirmed = event.status === "参加確定";
  const emphasisClassName = !isConfirmed
    ? "border-dashed border-[var(--line-strong)] bg-[var(--panel-raised)] opacity-80"
    : event.format === "オンライン"
      ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_3px_12px_var(--shadow)]"
      : "border-[var(--line-strong)] bg-[var(--panel-raised)]";

  return (
    <article className={`grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 border-l-3 px-3 py-3.5 ${emphasisClassName}`}>
      <div className="border-r border-[var(--line)] pr-3 text-center"><p className="font-mono text-xs font-bold text-[var(--text-strong)]">{event.date.slice(5).replace("-", "/")}</p><p className="mt-1 font-mono text-xs font-bold text-[var(--accent)]">{event.time}</p></div>
      <div className="min-w-0">
        <h3 className="truncate text-xs font-bold text-[var(--text-strong)]">
          {showCompany ? event.company : event.title}
        </h3>
        {showCompany && (
          <p className="mt-1 truncate text-[11px] font-semibold text-[var(--text)]">
            {event.title}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <button type="button" onClick={() => onEdit(event)} className="flex items-center justify-center gap-1 border border-[var(--line)] px-2.5 py-1.5 text-[9px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"><Pencil className="size-3" />編集</button>
      </div>
      <details className="col-span-3 border-t border-[var(--line)] pt-2">
        <summary className="text-[9px] font-semibold text-[var(--accent)]">
          詳細を表示
        </summary>

        <div className="mt-2 flex items-start justify-between gap-3">
          {/* Memo */}
          <div className="flex-1">
            {event.memo && (
              <p className="pl-2 text-[12px] leading-relaxed text-[var(--muted)]">
                {event.memo}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <span className="flex items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2 py-1 text-[9px] font-semibold text-[var(--muted)]">
              {event.format === "オンライン" ? (
                <Video className="size-3" />
              ) : (
                <MapPin className="size-3" />
              )}
              {event.format}
            </span>

          </div>
        </div>
      </details>
    </article>
  );
}
