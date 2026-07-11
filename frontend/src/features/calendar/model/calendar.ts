export type EventCategory = "説明会" | "面接" | "カジュアル面談" | "試験";
export type EventFormat = "オンライン" | "オフライン";
export type AttendanceStatus = "参加確定" | "不確定";

export type CalendarEvent = {
  id: number;
  title: string;
  company: string;
  date: string;
  time: string;
  category: EventCategory;
  format: EventFormat;
  status: AttendanceStatus;
  location: string;
  memo?: string;
};

export const eventCategories: EventCategory[] = [
  "説明会",
  "面接",
  "カジュアル面談",
  "試験",
];

export const eventFormats: EventFormat[] = ["オンライン", "オフライン"];
export const attendanceStatuses: AttendanceStatus[] = ["参加確定", "不確定"];

export const calendarEvents: CalendarEvent[] = [
  { id: 1, title: "会社説明会", company: "株式会社ネクスト", date: "2026-07-02", time: "10:00", category: "説明会", format: "オンライン", status: "参加確定", location: "Zoom" },
  { id: 2, title: "一次面接", company: "青山テクノロジー", date: "2026-07-06", time: "14:00", category: "面接", format: "オフライン", status: "参加確定", location: "東京本社" },
  { id: 3, title: "適性検査", company: "北斗システムズ", date: "2026-07-09", time: "18:00", category: "試験", format: "オンライン", status: "不確定", location: "受検サイト" },
  { id: 4, title: "採用担当者との面談", company: "クラフトワークス", date: "2026-07-12", time: "11:30", category: "カジュアル面談", format: "オンライン", status: "参加確定", location: "Google Meet", memo: "事業内容と配属後の働き方について質問する。" },
  { id: 5, title: "最終面接", company: "青山テクノロジー", date: "2026-07-16", time: "13:00", category: "面接", format: "オフライン", status: "参加確定", location: "東京本社", memo: "受付は開始15分前。履歴書を1部持参する。" },
  { id: 6, title: "エンジニア向け説明会", company: "星野デジタル", date: "2026-07-21", time: "16:00", category: "説明会", format: "オンライン", status: "不確定", location: "Zoom" },
  { id: 7, title: "二次面接", company: "株式会社ネクスト", date: "2026-07-24", time: "10:30", category: "面接", format: "オンライン", status: "参加確定", location: "Teams", memo: "前回聞かれた志望動機を具体例と一緒に整理しておく。" },
  { id: 8, title: "筆記試験", company: "東都ファイナンス", date: "2026-07-28", time: "09:30", category: "試験", format: "オフライン", status: "不確定", location: "新宿テストセンター" },
  { id: 9, title: "若手社員との座談会", company: "星野デジタル", date: "2026-08-04", time: "17:00", category: "カジュアル面談", format: "オンライン", status: "不確定", location: "Zoom" },
];
