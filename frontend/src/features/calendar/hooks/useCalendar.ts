import { useOptimisticState, temporaryId } from '@/shared/useOptimisticState';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Event } from '@/api/generated/models/event';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import { getCalendarDays, toDateKey } from '@/features/calendar/lib/calendar';
import type {
  CalendarEvent,
  EventCategory,
} from '@/features/calendar/model/calendar';
import {
  eventFromForm,
  eventOverlapsMonth,
  deleteEventRequest,
  loadEventCompanies,
  loadEvents,
  saveEventRequest,
  selectUpcomingEvents,
  toCalendarEvent,
} from '@/features/calendar/lib/calendarApi';
import { toast } from '@/shared/toast';

export type OnlineFilter = 'online' | 'offline' | 'すべて';
export type AttendanceFilter = 'attending' | 'notAttending' | 'すべて';

type CalendarData = {
  month: string;
  currentMonth: string;
  displayed: Event[];
  current: Event[];
  companies: CompanyListItem[];
};

export function useCalendar() {
  const [loadResult, setLoadResult] = useState<{
    key: string;
    failed: boolean;
  } | null>(null);
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const [today, setToday] = useState(() => toDateKey(new Date()));
  const month = toDateKey(displayDate).slice(0, 7);
  const currentMonth = today.slice(0, 7);
  const requestKey = `${month}/${currentMonth}`;
  const state = useOptimisticState<CalendarData | undefined>(undefined);
  const { value: data, setValue: setData } = state;
  const [category, setCategory] = useState<EventCategory | 'すべて'>('すべて');
  const [format, setFormat] = useState<OnlineFilter>('すべて');
  const [status, setStatus] = useState<AttendanceFilter>('すべて');
  const ready = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setToday(toDateKey(new Date())), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let failed = false;
    mounted.current = true;
    ready.current = false;
    const displayed = loadEvents(month, controller.signal);
    const current =
      month === currentMonth
        ? displayed
        : loadEvents(currentMonth, controller.signal);
    void Promise.all([
      displayed,
      current,
      loadEventCompanies(controller.signal),
    ])
      .then(([displayed, current, companies]) => {
        if (controller.signal.aborted) return;
        setData({ month, currentMonth, displayed, current, companies });
        ready.current = true;
      })
      .catch(() => {
        failed = true;
        if (!controller.signal.aborted)
          toast.error(
            '予定・企業一覧を取得できませんでした。画面を再読み込みしてください。',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted)
          setLoadResult({ key: requestKey, failed });
      });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [month, currentMonth, requestKey, setData]);

  const { events, upcomingEvents } = useMemo(() => {
    function matches(event: CalendarEvent) {
      return (
        (category === 'すべて' || event.category === category) &&
        (format === 'すべて' || event.isOnline === (format === 'online')) &&
        (status === 'すべて' ||
          (status === 'attending'
            ? event.isAttending !== false
            : event.isAttending === false))
      );
    }
    const displayed = data?.month === month ? data.displayed : [];
    const current = data?.currentMonth === currentMonth ? data.current : [];
    return {
      events: displayed.map(toCalendarEvent).filter(matches),
      upcomingEvents: selectUpcomingEvents(
        current.map(toCalendarEvent).filter(matches),
        today,
      ),
    };
  }, [data, month, currentMonth, today, category, format, status]);

  function saveEvent(form: Omit<CalendarEvent, 'id'>, id?: number) {
    if (
      !ready.current ||
      !data ||
      data.month !== month ||
      data.currentMonth !== currentMonth
    )
      return Promise.resolve(false);
    const original = [...data.displayed, ...data.current].find(
      (event) => event.id === id,
    );
    const localId = id ?? temporaryId();
    return state.mutate(
      (current) => {
        if (!current) return current;
        if (id !== undefined && !original)
          throw new Error('編集対象の予定が見つかりません。');
        const event = eventFromForm(form, localId, current.companies, original);
        const replace = (events: Event[], month: string) => [
          ...events.filter((item) => item.id !== localId),
          ...(eventOverlapsMonth(event, month) ? [event] : []),
        ];
        return {
          ...current,
          displayed: replace(current.displayed, current.month),
          current: replace(current.current, current.currentMonth),
        };
      },
      () => saveEventRequest(form, data.companies, original),
      (current, savedId) => {
        if (!current) return current;
        const identify = (events: Event[]) =>
          events.map((event) =>
            event.id === localId ? { ...event, id: savedId } : event,
          );
        return {
          ...current,
          displayed: identify(current.displayed),
          current: identify(current.current),
        };
      },
    );
  }

  return {
    loading: loadResult?.key !== requestKey,
    loadError: loadResult?.key === requestKey && loadResult.failed,
    displayDate,
    days: getCalendarDays(displayDate),
    events,
    upcomingEvents,
    category,
    format,
    status,
    setCategory,
    setFormat,
    setStatus,
    setDisplayDate: (date: Date) => {
      if (!state.isBusy()) setDisplayDate(date);
    },
    companyOptions: [
      ...new Set(data?.companies.map((company) => company.name) ?? []),
    ],
    saveEvent,
    deleteEvent: (id: number) => {
      if (!ready.current || id < 0) return Promise.resolve(false);
      return state.mutate(
        (current) =>
          current
            ? {
                ...current,
                displayed: current.displayed.filter((event) => event.id !== id),
                current: current.current.filter((event) => event.id !== id),
              }
            : current,
        () => deleteEventRequest(id),
      );
    },
    moveMonth: (offset: number) => {
      if (state.isBusy()) return;
      setDisplayDate(
        (current) =>
          new Date(current.getFullYear(), current.getMonth() + offset, 1),
      );
    },
    goToToday: () => {
      if (state.isBusy()) return;
      const now = new Date();
      setToday(toDateKey(now));
      setDisplayDate(now);
    },
  };
}
