export type EventCategory =
  | "session"    // 説明会
  | "interview"  // 面接
  | "chat"       // カジュアル面談
  | "internship" // インターン
  | "other";     // その他

export type CalendarEvent = {
  id: number;
  company?: string;
  category: EventCategory;
  title: string;
  note: string;
  isAllDay: boolean;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isOnline: boolean;
  isAttending?: boolean;
};

export const eventCategories: EventCategory[] = [
  "session",
  "interview",
  "chat",
  "internship",
  "other",
];

export const eventCategoryLabels: Record<EventCategory, string> = {
  session: "説明会",
  interview: "面接",
  chat: "カジュアル面談",
  internship: "インターン",
  other: "その他",
};

export const attendanceEnabledCategories: EventCategory[] = [
  "session",
  "internship",
  "other",
];

export const calendarEvents: CalendarEvent[] = [
  { id: 1, title: "会社説明会", company: "株式会社ネクスト", note: "", isAllDay: false, startDate: "2026-07-02", endDate: "2026-07-02", startTime: "10:00", endTime: "11:30", category: "session", isOnline: true, isAttending: true },
  { id: 2, title: "一次面接", company: "青山テクノロジー株式会社", note: "", isAllDay: false, startDate: "2026-07-06", endDate: "2026-07-06", startTime: "14:00", endTime: "15:00", category: "interview", isOnline: false },
  { id: 3, title: "適性検査", company: "北斗システムズ", note: "", isAllDay: true, startDate: "2026-07-09", endDate: "2026-07-09", category: "other", isOnline: true, isAttending: true },
  { id: 4, title: "採用担当者との面談", company: "クラフトワークス", note: "事業内容と配属後の働き方について質問する。", isAllDay: false, startDate: "2026-07-12", endDate: "2026-07-12", startTime: "11:30", endTime: "12:15", category: "chat", isOnline: true },
  { id: 5, title: "最終面接", company: "青山テクノロジー株式会社", note: "受付は開始15分前。履歴書を1部持参する。", isAllDay: false, startDate: "2026-07-16", endDate: "2026-07-16", startTime: "13:00", endTime: "14:00", category: "interview", isOnline: false },
  { id: 6, title: "エンジニア向け説明会", company: "星野デジタル", note: "", isAllDay: false, startDate: "2026-07-21", endDate: "2026-07-21", startTime: "16:00", endTime: "17:00", category: "session", isOnline: true, isAttending: false },
  { id: 7, title: "二次面接", company: "株式会社ネクスト", note: "前回聞かれた志望動機を具体例と一緒に整理しておく。", isAllDay: false, startDate: "2026-07-24", endDate: "2026-07-24", startTime: "10:30", endTime: "11:30", category: "interview", isOnline: true },
  { id: 8, title: "筆記試験", company: "東都ファイナンス", note: "", isAllDay: false, startDate: "2026-07-28", endDate: "2026-07-28", startTime: "09:30", endTime: "11:00", category: "other", isOnline: false, isAttending: true },
  { id: 9, title: "3daysインターン", company: "星野デジタル", note: "", isAllDay: true, startDate: "2026-08-04", endDate: "2026-08-06", category: "internship", isOnline: false, isAttending: true },
];
