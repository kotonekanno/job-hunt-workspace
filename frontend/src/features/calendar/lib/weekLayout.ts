import type { CalendarEvent } from '@/features/calendar/model/calendar';
import { toDateKey, type CalendarDay } from './calendar';
import { getEventSortKey } from './eventTime';

export type WeekEventSegment = {
  event: CalendarEvent;
  startColumn: number;
  endColumn: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

function lastDay(event: CalendarEvent) {
  const end = event.endDate || event.startDate;
  // A timed event ending at midnight does not occupy the following day.
  if (!event.isAllDay && event.endTime === '00:00' && end > event.startDate) {
    const date = new Date(`${end}T00:00:00`);
    date.setDate(date.getDate() - 1);
    return toDateKey(date);
  }
  return end;
}

export function layoutWeekEvents(
  days: CalendarDay[],
  events: CalendarEvent[],
): WeekEventSegment[] {
  const first = days[0]?.dateKey;
  const last = days.at(-1)?.dateKey;
  if (!first || !last) return [];
  const segments = events
    .flatMap((event) => {
      const end = lastDay(event);
      if (
        !event.startDate ||
        end < first ||
        event.startDate > last ||
        end < event.startDate
      )
        return [];
      const startIndex = days.findIndex(
        (day) => day.dateKey >= event.startDate,
      );
      const afterEndIndex = days.findIndex((day) => day.dateKey > end);
      const endIndex = (afterEndIndex < 0 ? days.length : afterEndIndex) - 1;
      return [
        {
          event,
          startColumn: startIndex + 1,
          endColumn: endIndex + 2,
          continuesBefore: event.startDate < first,
          continuesAfter: end > last,
        },
      ];
    })
    .sort((a, b) => {
      const aMulti = lastDay(a.event) > a.event.startDate;
      const bMulti = lastDay(b.event) > b.event.startDate;
      return (
        Number(bMulti) - Number(aMulti) ||
        a.startColumn - b.startColumn ||
        b.endColumn - b.startColumn - (a.endColumn - a.startColumn) ||
        getEventSortKey(a.event).localeCompare(getEventSortKey(b.event)) ||
        a.event.id - b.event.id
      );
    });
  const lanes: Set<number>[] = [];
  return segments.map((segment) => {
    const columns = Array.from(
      { length: segment.endColumn - segment.startColumn },
      (_, index) => segment.startColumn + index,
    );
    let lane = lanes.findIndex((occupied) =>
      columns.every((column) => !occupied.has(column)),
    );
    if (lane < 0) {
      lane = lanes.length;
      lanes.push(new Set());
    }
    columns.forEach((column) => lanes[lane].add(column));
    return { ...segment, lane };
  });
}
