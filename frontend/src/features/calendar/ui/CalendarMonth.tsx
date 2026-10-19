import { toDateKey, type CalendarDay } from '@/features/calendar/lib/calendar';
import type { CalendarEvent } from '@/features/calendar/model/calendar';
import { layoutWeekEvents } from '@/features/calendar/lib/weekLayout';
import { CalendarEventItem } from '@/features/calendar/ui/CalendarEventItem';

type CalendarMonthProps = {
  days: CalendarDay[];
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: number) => void | Promise<boolean>;
};

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

export function CalendarMonth({
  days,
  events,
  onEdit,
  onDelete,
}: CalendarMonthProps) {
  const todayKey = toDateKey(new Date());
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );

  return (
    <div className="ui-panel overflow-x-auto border border-[var(--line)] transition-colors duration-300">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--panel-raised)]">
          {weekdays.map((weekday, index) => (
            <div
              key={weekday}
              className={`
                px-2 py-2 text-center font-mono text-[10px] font-semibold
                ${
                  index === 0
                    ? 'text-rose-500'
                    : index === 6
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--muted)]'
                }
              `}
            >
              {weekday}
            </div>
          ))}
        </div>

        <div>
          {weeks.map((week) => {
            const segments = layoutWeekEvents(week, events);
            const laneCount = Math.max(
              0,
              ...segments.map((segment) => segment.lane + 1),
            );
            return (
              <div
                key={week[0]?.dateKey}
                className="relative grid min-h-24 grid-cols-7 content-start py-1.5"
                style={{
                  gridTemplateRows: laneCount
                    ? `26px repeat(${laneCount}, 22px)`
                    : '26px',
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 grid grid-cols-7"
                >
                  {week.map((day, index) => (
                    <div
                      key={day.dateKey}
                      className={`border-b border-[var(--line)] ${index < 6 ? 'border-r' : ''}`}
                    />
                  ))}
                </div>
                {week.map((day, index) => (
                  <div
                    key={day.dateKey}
                    className={`relative min-w-0 px-1.5 ${!day.isCurrentMonth ? 'opacity-35' : ''}`}
                    style={{ gridColumn: index + 1, gridRow: 1 }}
                  >
                    <span
                      className={`flex size-6 items-center justify-center text-[10px] font-semibold ${day.dateKey === todayKey ? 'cyber-cut-sm bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--muted)]'}`}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>
                ))}
                {segments.map((segment) => (
                  <div
                    key={segment.event.id}
                    className={`relative mx-1.5 min-w-0 ${week.slice(segment.startColumn - 1, segment.endColumn - 1).every((day) => !day.isCurrentMonth) ? 'opacity-35' : ''}`}
                    style={{
                      gridColumn: `${segment.startColumn} / ${segment.endColumn}`,
                      gridRow: segment.lane + 2,
                    }}
                  >
                    <CalendarEventItem
                      event={segment.event}
                      continuesBefore={segment.continuesBefore}
                      continuesAfter={segment.continuesAfter}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
