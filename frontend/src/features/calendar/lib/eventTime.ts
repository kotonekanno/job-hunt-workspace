import type { Event } from '@/api/generated/models';
import { toDateKey } from './calendar';

export function localTime(value?: string | null) {
  return value
    ? new Date(value).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
    : '--:--';
}
export function getEventStartDate(event: Event) {
  return event.isAllDay
    ? (event.startDay ?? '')
    : event.startTime
      ? toDateKey(new Date(event.startTime))
      : '';
}
export function getEventEndDate(event: Event) {
  return event.isAllDay
    ? (event.endDay ?? '')
    : event.endTime
      ? toDateKey(new Date(event.endTime))
      : '';
}
export function getEventStartTimeLabel(event: Event) {
  return event.isAllDay ? '終日' : localTime(event.startTime);
}
export function getEventTimeRangeLabel(event: Event) {
  return event.isAllDay
    ? '終日'
    : `${localTime(event.startTime)}–${localTime(event.endTime)}`;
}
export function getEventSortKey(event: Event) {
  return `${getEventStartDate(event)}${event.isAllDay ? '00:00' : localTime(event.startTime)}`;
}
