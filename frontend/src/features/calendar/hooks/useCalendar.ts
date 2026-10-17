import { useEffect, useMemo, useRef, useState } from 'react';
import type { Event } from '@/api/generated/models/event';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import { getCalendarDays, toDateKey } from '@/features/calendar/lib/calendar';
import type {
  CalendarEvent,
  EventCategory,
} from '@/features/calendar/model/calendar';
import {
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
  const [displayDate, setDisplayDate] = useState(() => new Date());
  const [today, setToday] = useState(() => toDateKey(new Date()));
  const month = toDateKey(displayDate).slice(0, 7);
  const currentMonth = today.slice(0, 7);
  const [data, setData] = useState<CalendarData>();
  const [revision, setRevision] = useState(0);
  const [category, setCategory] = useState<EventCategory | 'すべて'>('すべて');
  const [format, setFormat] = useState<OnlineFilter>('すべて');
  const [status, setStatus] = useState<AttendanceFilter>('すべて');
  const busy = useRef(false);
  const ready = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setToday(toDateKey(new Date())), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
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
        if (!controller.signal.aborted)
          toast.error(
            '予定・企業一覧を取得できませんでした。画面を再読み込みしてください。',
          );
      });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [month, currentMonth, revision]);

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

  async function mutate(action: () => Promise<void>) {
    if (busy.current) return false;
    if (
      !ready.current ||
      !data ||
      data.month !== month ||
      data.currentMonth !== currentMonth
    ) {
      toast.error(
        '一覧の読み込みが完了していません。読み込みに失敗した場合は画面を再読み込みしてください。',
      );
      return false;
    }
    busy.current = true;
    try {
      await action();
      ready.current = false;
      if (mounted.current) setRevision((value) => value + 1);
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '予定の更新に失敗しました。もう一度お試しください。',
      );
      return false;
    } finally {
      busy.current = false;
    }
  }

  function saveEvent(form: Omit<CalendarEvent, 'id'>, id?: number) {
    return mutate(async () => {
      const original = [
        ...(data?.displayed ?? []),
        ...(data?.current ?? []),
      ].find((event) => event.id === id);
      if (id !== undefined && !original)
        throw new Error('編集対象の予定を再取得してください。');
      await saveEventRequest(form, data?.companies ?? [], original);
    });
  }

  return {
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
    setDisplayDate,
    companyOptions: [
      ...new Set(data?.companies.map((company) => company.name) ?? []),
    ],
    saveEvent,
    deleteEvent: (id: number) => mutate(() => deleteEventRequest(id)),
    moveMonth: (offset: number) =>
      setDisplayDate(
        (current) =>
          new Date(current.getFullYear(), current.getMonth() + offset, 1),
      ),
    goToToday: () => {
      const now = new Date();
      setToday(toDateKey(now));
      setDisplayDate(now);
    },
  };
}
