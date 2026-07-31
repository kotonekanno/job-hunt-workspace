export type EventCategory =
  | "説明会"
  | "面接"
  | "カジュアル面談"
  | "インターン"
  | "その他";
export type EventFormat = "オンライン" | "オフライン";
export type AttendanceStatus = "参加" | "不参加";

export type CalendarEvent = {
  id: number;
  title: string;
  company: string;
  date: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  category: EventCategory;
  format: EventFormat;
  status?: AttendanceStatus;
  memo?: string;
};

export const eventCategories: EventCategory[] = [
  "説明会",
  "面接",
  "カジュアル面談",
  "インターン",
  "その他",
];

export const eventFormats: EventFormat[] = ["オンライン", "オフライン"];
export const attendanceStatuses: AttendanceStatus[] = ["参加", "不参加"];

export const attendanceEnabledCategories: EventCategory[] = [
  "説明会",
  "インターン",
  "その他",
];

export const calendarEvents: CalendarEvent[] = [
  { id: 1, title: "会社説明会", company: "株式会社ネクスト", date: "2026-07-02", endDate: "2026-07-02", allDay: false, startTime: "10:00", endTime: "11:30", category: "説明会", format: "オンライン", status: "参加" },
  { id: 2, title: "一次面接", company: "青山テクノロジー株式会社", date: "2026-07-06", endDate: "2026-07-06", allDay: false, startTime: "14:00", endTime: "15:00", category: "面接", format: "オフライン" },
  { id: 3, title: "適性検査", company: "北斗システムズ", date: "2026-07-09", endDate: "2026-07-09", allDay: true, category: "その他", format: "オンライン", status: "参加" },
  { id: 4, title: "採用担当者との面談", company: "クラフトワークス", date: "2026-07-12", endDate: "2026-07-12", allDay: false, startTime: "11:30", endTime: "12:15", category: "カジュアル面談", format: "オンライン", memo: "事業内容と配属後の働き方について質問する。" },
  { id: 5, title: "最終面接", company: "青山テクノロジー株式会社", date: "2026-07-16", endDate: "2026-07-16", allDay: false, startTime: "13:00", endTime: "14:00", category: "面接", format: "オフライン", memo: "受付は開始15分前。履歴書を1部持参する。" },
  { id: 6, title: "エンジニア向け説明会", company: "星野デジタル", date: "2026-07-21", endDate: "2026-07-21", allDay: false, startTime: "16:00", endTime: "17:00", category: "説明会", format: "オンライン", status: "不参加" },
  { id: 7, title: "二次面接", company: "株式会社ネクスト", date: "2026-07-24", endDate: "2026-07-24", allDay: false, startTime: "10:30", endTime: "11:30", category: "面接", format: "オンライン", memo: "前回聞かれた志望動機を具体例と一緒に整理しておく。" },
  { id: 8, title: "筆記試験", company: "東都ファイナンス", date: "2026-07-28", endDate: "2026-07-28", allDay: false, startTime: "09:30", endTime: "11:00", category: "その他", format: "オフライン", status: "参加" },
  { id: 9, title: "3daysインターン", company: "星野デジタル", date: "2026-08-04", endDate: "2026-08-06", allDay: true, category: "インターン", format: "オフライン", status: "参加" },
];
