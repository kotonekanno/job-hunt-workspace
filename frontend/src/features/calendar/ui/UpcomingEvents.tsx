import { Pencil } from "lucide-react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";

type UpcomingEventsProps = {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void
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
          <UpcomingEvent event={event} onEdit={onEdit} />
        ))}
      </div>
    </aside>
  );
}

type UpcomingEventProps = {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
}

function UpcomingEvent({ event, onEdit }: UpcomingEventProps) {
  return (
    <article key={event.id} className={`grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 border-l-3 px-3 py-3.5 ${event.format === "オンライン" ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_3px_12px_var(--shadow)]" : "border-[var(--line-strong)] bg-[var(--panel-raised)]"}`}>
      <div className="border-r border-[var(--line)] pr-3 text-center"><p className="font-mono text-xs font-bold text-[var(--text-strong)]">{event.date.slice(5).replace("-", "/")}</p><p className="mt-1 font-mono text-xs font-bold text-[var(--accent)]">{event.time}</p></div>
      <div className="min-w-0"><h3 className="truncate text-xs font-bold text-[var(--text-strong)]">{event.company}</h3><p className="mt-1 truncate text-[11px] font-semibold text-[var(--text)]">{event.title}</p></div>
      <button type="button" onClick={() => onEdit(event)} className="flex items-center justify-center gap-1 border border-[var(--line)] px-2.5 py-1.5 text-[9px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"><Pencil className="size-3" />編集</button>
      {event.memo && <details className="col-span-3 border-t border-[var(--line)] pt-2"><summary className="cursor-pointer text-[9px] font-semibold text-[var(--accent)]">メモを表示</summary><p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">{event.memo}</p></details>}
    </article>
  );
}