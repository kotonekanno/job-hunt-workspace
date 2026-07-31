import { useMemo, useState } from "react";
import { getCalendarDays } from "@/features/calendar/lib/calendar";
import {
  calendarEvents,
  type CalendarEvent,
  type EventCategory,
} from "@/features/calendar/model/calendar";

export type OnlineFilter = "online" | "offline" | "すべて";
export type AttendanceFilter = "attending" | "notAttending" | "すべて";

export function useCalendar() {
  const [displayDate, setDisplayDate] = useState(new Date(2026, 6, 1));
  const [events, setEvents] = useState<CalendarEvent[]>(calendarEvents);
  const [category, setCategory] = useState<EventCategory | "すべて">("すべて");
  const [format, setFormat] = useState<OnlineFilter>("すべて");
  const [status, setStatus] = useState<AttendanceFilter>("すべて");

  const filteredEvents = useMemo(
    () => events.filter((event) =>
      (category === "すべて" || event.category === category)
      && (format === "すべて" || event.isOnline === (format === "online"))
      && (status === "すべて"
        || event.isAttending === (status === "attending"))),
    [events, category, format, status],
  );

  const upcomingEvents = useMemo(
    () => events.filter((event) =>
      event.isAttending !== false
      && (category === "すべて" || event.category === category)
      && (format === "すべて" || event.isOnline === (format === "online"))),
    [events, category, format],
  );

  function saveEvent(event: Omit<CalendarEvent, "id">, id?: number) {
    if (id !== undefined) {
      setEvents((current) => current.map((item) =>
        item.id === id ? { ...event, id } : item));
      return;
    }

    setEvents((current) => [
      ...current,
      {
        ...event,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
      },
    ]);
  }

  function deleteEvent(eventId: number) {
    setEvents((current) => current.filter(
      (event) => event.id !== eventId,
    ));
  }

  function moveMonth(offset: number) {
    setDisplayDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return {
    displayDate,
    days: getCalendarDays(displayDate),
    events: filteredEvents,
    upcomingEvents,
    category,
    format,
    status,
    setCategory,
    setFormat,
    setStatus,
    setDisplayDate,
    saveEvent,
    deleteEvent,
    moveMonth,
    goToToday: () => setDisplayDate(new Date(2026, 6, 1)),
  };
}
