import { useCallback, useMemo, useState } from 'react';
import { authenticatedRequest } from '@/api/authenticatedRequest';
import * as api from '@/api/generated/api';
import type { CreateEventRequest, EventCategory } from '@/api/generated/models';
import { requireStatus, useApiResource } from '@/api/useApiResource';
import { getCalendarDays, toDateKey } from '../lib/calendar';

export type OnlineFilter = 'online' | 'offline' | 'すべて';
export type AttendanceFilter = 'attending' | 'notAttending' | 'すべて';

export function useCalendar() {
  const [displayDate, setDisplayDate] = useState(new Date());
  const month = toDateKey(displayDate).slice(0, 7);
  const loader = useCallback(
    async (signal: AbortSignal) => {
      // Fetch all months visible in the six-week grid, including its adjacent days.
      const [year, monthNumber] = month.split('-').map(Number);
      const months = [
        ...new Set(
          getCalendarDays(new Date(year, monthNumber - 1, 1)).map((day) =>
            day.dateKey.slice(0, 7),
          ),
        ),
      ];
      const responses = await Promise.all(
        months.map((month) =>
          authenticatedRequest((options) => api.getEvents({ month }, options), {
            signal,
          }),
        ),
      );
      const events = responses.flatMap((response) => {
        if (response.status !== 200)
          throw new Error('予定を取得できませんでした。');
        return response.data.events;
      });
      return {
        month,
        events: [...new Map(events.map((event) => [event.id, event])).values()],
      };
    },
    [month],
  );
  const resource = useApiResource(loader);
  const [category, setCategory] = useState<EventCategory | 'すべて'>('すべて');
  const [format, setFormat] = useState<OnlineFilter>('すべて');
  const [status, setStatus] = useState<AttendanceFilter>('すべて');
  const events = useMemo(
    () => (resource.data?.month === month ? resource.data.events : []),
    [resource.data, month],
  );
  const filteredEvents = events.filter(
    (event) =>
      (category === 'すべて' || event.category === category) &&
      (format === 'すべて' || event.isOnline === (format === 'online')) &&
      (status === 'すべて' || event.isAttending === (status === 'attending')),
  );
  async function saveEvent(request: CreateEventRequest, id?: number) {
    requireStatus(
      id === undefined
        ? await authenticatedRequest((options) =>
            api.createEvent(request, options),
          )
        : await authenticatedRequest((options) =>
            api.patchEvent(id, request, options),
          ),
      id === undefined ? 201 : 204,
    );
    await resource.refresh();
  }
  async function deleteEvent(id: number) {
    requireStatus(
      await authenticatedRequest((options) => api.deleteEvent(id, options)),
    );
    await resource.refresh();
  }
  return {
    displayDate,
    days: getCalendarDays(displayDate),
    events: filteredEvents,
    upcomingEvents: filteredEvents.filter(
      (event) => event.isAttending !== false,
    ),
    category,
    format,
    status,
    setCategory,
    setFormat,
    setStatus,
    setDisplayDate,
    saveEvent,
    deleteEvent,
    isLoading: resource.isLoading,
    error: resource.error,
    moveMonth: (offset: number) =>
      setDisplayDate(
        (date) => new Date(date.getFullYear(), date.getMonth() + offset, 1),
      ),
    goToToday: () => setDisplayDate(new Date()),
  };
}
