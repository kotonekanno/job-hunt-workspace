import type { CalendarEvent } from "@/features/calendar/model/calendar";

export function getEventStartTimeLabel(event: CalendarEvent) {
  if (event.allDay) {
    return "終日";
  }

  return event.startTime ?? "--:--";
}

export function getEventTimeRangeLabel(event: CalendarEvent) {
  if (event.allDay) {
    return "終日";
  }

  if (event.startTime && event.endTime) {
    return `${event.startTime}–${event.endTime}`;
  }

  return event.startTime ?? event.endTime ?? "時刻未定";
}

export function getEventSortKey(event: CalendarEvent) {
  return `${event.date}${event.allDay ? "00:00" : event.startTime ?? "23:59"}`;
}
