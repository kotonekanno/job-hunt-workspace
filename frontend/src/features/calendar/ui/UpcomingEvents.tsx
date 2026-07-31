import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { getEventSortKey } from "@/features/calendar/lib/eventTime";
import { EventListItem } from "@/features/calendar/ui/EventListItem";

type UpcomingEventsProps = {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: number) => void;
};

export function UpcomingEvents({
  events,
  onEdit,
  onDelete,
}: UpcomingEventsProps) {
  const upcomingEvents = [...events]
    .filter((event) => event.date >= "2026-07-12")
    .sort((left, right) =>
      getEventSortKey(left).localeCompare(getEventSortKey(right)))
    .slice(0, 4);

  return (
    <aside className="cyber-cut border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_8px_28px_var(--shadow)] transition-colors duration-300">
      <div className="flex items-end justify-between border-b border-[var(--line)] pb-3">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">
            // UPCOMING
          </p>
          <h2 className="mt-0.5 text-sm font-bold text-[var(--text-strong)]">
            直近の予定
          </h2>
        </div>
        <span className="font-mono text-[9px] text-[var(--faint)]">
          {upcomingEvents.length} EVENTS
        </span>
      </div>
      <div className="mt-2 space-y-2">
        {upcomingEvents.length === 0 && (
          <p className="py-6 text-center text-xs text-[var(--faint)]">
            該当する予定はありません
          </p>
        )}
        {upcomingEvents.map((event) => (
          <EventListItem
            key={event.id}
            event={event}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </aside>
  );
}
