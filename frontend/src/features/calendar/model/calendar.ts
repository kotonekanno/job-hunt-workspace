import type { Event } from '@/api/generated/models/event';
import type { EventCategory } from '@/api/generated/models/eventCategory';
export type { EventCategory } from '@/api/generated/models/eventCategory';

// Display/form state separates local dates and clock times from API timestamps.
export type CalendarEvent = Omit<
  Event,
  | 'companyName'
  | 'note'
  | 'startDay'
  | 'endDay'
  | 'startTime'
  | 'endTime'
  | 'isAttending'
> & {
  company?: string;
  note: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isAttending?: boolean;
};

export const eventCategories: EventCategory[] = [
  'SESSION',
  'INTERVIEW',
  'CHAT',
  'INTERNSHIP',
  'OTHER',
];

export const eventCategoryLabels: Record<EventCategory, string> = {
  SESSION: '説明会',
  INTERVIEW: '面接',
  CHAT: 'カジュアル面談',
  INTERNSHIP: 'インターン',
  OTHER: 'その他',
};

export const attendanceEnabledCategories: EventCategory[] = [
  'SESSION',
  'INTERNSHIP',
  'OTHER',
];
