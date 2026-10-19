import { useOptimisticState, temporaryId } from '@/shared/useOptimisticState';
import type { Event } from '@/api/generated/models/event';
import type { GetCompanyLookupResponseCompaniesItem } from '@/api/generated/models/getCompanyLookupResponseCompaniesItem';
import type { CalendarEvent } from '@/features/calendar/model/calendar';
import {
  eventFromForm,
  eventRequest,
  deleteEventRequest,
  saveEventRequest,
  toCalendarEvent,
} from '@/features/calendar/lib/calendarApi';
import { getEventSortKey } from '@/features/calendar/lib/eventTime';

export function selectCompanyEvents(
  events: CalendarEvent[],
  today: string,
  showPast: boolean,
) {
  return events
    .filter((event) => showPast || event.startDate >= today)
    .sort((a, b) => {
      const order =
        getEventSortKey(a).localeCompare(getEventSortKey(b)) || a.id - b.id;
      return order;
    });
}
export function useCompanyEvents(
  companyId: number,
  companies: GetCompanyLookupResponseCompaniesItem[],
  initialEvents: Event[],
) {
  const state = useOptimisticState<Event[]>(initialEvents);
  const events = state.value;
  return {
    events: events.map(toCalendarEvent),
    saveEvent: (form: Omit<CalendarEvent, 'id'>, id?: number) => {
      const original = events.find((event) => event.id === id);
      const localId = id ?? temporaryId();
      return state.mutate(
        (items) => {
          if (id !== undefined && !original)
            throw new Error('編集対象の予定が見つかりません。');
          const request = eventRequest(form, companies, original);
          const event = eventFromForm(form, localId, companies, original);
          const belongs =
            request.companyId === undefined || request.companyId === companyId;
          return [
            ...items.filter((item) => item.id !== localId),
            ...(belongs ? [event] : []),
          ];
        },
        () => saveEventRequest(form, companies, original),
        (items, savedId) =>
          items.map((item) =>
            item.id === localId ? { ...item, id: savedId } : item,
          ),
      );
    },
    deleteEvent: (id: number) =>
      id < 0
        ? Promise.resolve(false)
        : state.mutate(
            (items) => items.filter((item) => item.id !== id),
            () => deleteEventRequest(id),
          ),
  };
}
