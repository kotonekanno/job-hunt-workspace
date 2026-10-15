import type { EventCategory } from '@/api/generated/models';

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
