import {
  createEvent,
  deleteEvent,
  getCompanies,
  getEvents,
  patchEvent,
} from '@/api/generated/api';
import type { Event } from '@/api/generated/models/event';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { CreateEventRequest } from '@/api/generated/models/createEventRequest';
import type { UpdateEventRequest } from '@/api/generated/models/updateEventRequest';
import type { CalendarEvent } from '@/features/calendar/model/calendar';
import { attendanceEnabledCategories } from '@/features/calendar/model/calendar';
import { toDateKey } from './calendar';
import { getEventSortKey } from './eventTime';
import { getAccessToken } from '@/features/auth/model/accessToken';

function options(signal?: AbortSignal): RequestInit {
  const token = getAccessToken();
  return {
    signal,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function clockTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function toCalendarEvent(event: Event): CalendarEvent {
  const start = event.startTime ? new Date(event.startTime) : null;
  const end = event.endTime ? new Date(event.endTime) : null;
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    company: event.companyName ?? undefined,
    note: event.note ?? '',
    isAllDay: event.isAllDay,
    isOnline: event.isOnline,
    isAttending: event.isAttending ?? undefined,
    startDate: event.isAllDay
      ? (event.startDay ?? '')
      : start && !Number.isNaN(start.getTime())
        ? toDateKey(start)
        : '',
    endDate: event.isAllDay
      ? (event.endDay ?? '')
      : end && !Number.isNaN(end.getTime())
        ? toDateKey(end)
        : '',
    startTime: !event.isAllDay && start ? clockTime(start) : undefined,
    endTime: !event.isAllDay && end ? clockTime(end) : undefined,
  };
}

export function selectUpcomingEvents(events: CalendarEvent[], today: string) {
  return events
    .filter(
      (event) =>
        event.startDate >= today &&
        event.startDate.slice(0, 7) === today.slice(0, 7),
    )
    .sort(
      (left, right) =>
        getEventSortKey(left).localeCompare(getEventSortKey(right)) ||
        left.id - right.id,
    )
    .slice(0, 10);
}

export async function loadEvents(month: string, signal?: AbortSignal) {
  const response = await getEvents({ month }, options(signal));
  if (response.status !== 200) throw new Error('予定を取得できませんでした。');
  return response.data.events;
}

export async function loadEventCompanies(signal?: AbortSignal) {
  const response = await getCompanies(undefined, options(signal));
  if (response.status !== 200) throw new Error('企業を取得できませんでした。');
  return response.data.companies;
}

export function eventRequest(
  form: Omit<CalendarEvent, 'id'>,
  companies: CompanyListItem[],
  original?: Event,
): CreateEventRequest {
  const start = new Date(`${form.startDate}T${form.startTime || '00:00'}:00`);
  const end = new Date(`${form.endDate}T${form.endTime || '00:00'}:00`);
  if (
    !form.startDate ||
    !form.endDate ||
    form.endDate < form.startDate ||
    (!form.isAllDay &&
      (!form.startTime ||
        !form.endTime ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start))
  ) {
    throw new Error('開始・終了日時を確認してください。');
  }
  const request: CreateEventRequest = {
    title: form.title,
    note: form.note || null,
    category: form.category,
    isAllDay: form.isAllDay,
    isOnline: form.isOnline,
    startDay: form.isAllDay ? form.startDate : null,
    endDay: form.isAllDay ? form.endDate : null,
    startTime: form.isAllDay ? null : start.toISOString(),
    endTime: form.isAllDay ? null : end.toISOString(),
    isAttending: attendanceEnabledCategories.includes(form.category)
      ? (form.isAttending ?? true)
      : null,
  };
  if (original && (original.companyName ?? '') === (form.company ?? ''))
    return request;
  if (!form.company) return { ...request, companyId: null };
  const matches = companies.filter((company) => company.name === form.company);
  if (matches.length !== 1)
    throw new Error(
      '企業を一意に特定できません。企業の選択を確認してください。',
    );
  return { ...request, companyId: matches[0].id };
}

export async function saveEventRequest(
  form: Omit<CalendarEvent, 'id'>,
  companies: CompanyListItem[],
  original?: Event,
) {
  const request = eventRequest(form, companies, original);
  if (original) {
    const update: UpdateEventRequest = request;
    if ((await patchEvent(original.id, update, options())).status !== 204)
      throw new Error('予定の更新に失敗しました。');
  } else if ((await createEvent(request, options())).status !== 201)
    throw new Error('予定の追加に失敗しました。');
}

export async function deleteEventRequest(id: number) {
  if ((await deleteEvent(id, options())).status !== 204)
    throw new Error('予定の削除に失敗しました。');
}
