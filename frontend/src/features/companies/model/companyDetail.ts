import type { CalendarEvent } from "@/features/calendar/model/calendar";
import type { Selection, SelectionStatus } from "./selection";

export type WidgetType =
  | "basic-info"
  | "links"
  | "tasks"
  | "events"
  | "documents"
  | "selection"
  | "note";

export type CompanyDocument = {
  id: number;
  position: number;
  title: string;
  text: string;
};

export const widgetLabels: Record<WidgetType, string> = {
  "basic-info": "基本情報",
  links: "関連リンク集",
  tasks: "関連タスク",
  events: "関連イベント",
  documents: "テキスト",
  selection: "選考状況",
  note: "メモ",
};

export const widgetOrder: WidgetType[] = [
  "documents",
  "basic-info",
  "links",
  "selection",
  "note",
  "events",
  "tasks",
];

export const companyProfile = {
  name: "青山テクノロジー株式会社",
  selectionType: "本選考",
  selectionStep: "最終面接",
  selectionResult: "pending" as SelectionStatus,
  basicInfo: [
    ["業界", "IT・ソフトウェア"],
    ["所在地", "東京都港区青山 1-2-3"],
    ["従業員数", "1,240名"],
    ["採用職種", "ソフトウェアエンジニア"],
  ],
  links: [
    ["企業サイト", "https://example.com"],
    ["採用ページ", "https://example.com/recruit"],
    ["応募者マイページ", "https://example.com/mypage"],
  ],
};

export const relatedTasks = [
  { id: 1, title: "最終面接の想定質問を整理する", description: "志望動機、入社後に取り組みたいこと、逆質問をそれぞれ3つずつ準備する。", dueDate: "2026-07-15", company: "青山テクノロジー株式会社", completed: false },
  { id: 2, title: "交通経路を確認する", description: "本社までの経路と所要時間を確認し、開始15分前に到着できるようにする。", dueDate: "2026-07-14", company: "青山テクノロジー株式会社", completed: true },
  { id: 3, title: "履歴書を印刷する", description: "最新の内容であることを確認し、予備を含めて2部印刷する。", dueDate: "2026-07-13", company: "青山テクノロジー株式会社", completed: false },
];

export const relatedEvents: CalendarEvent[] = [
  { id: 1, title: "最終面接", company: "青山テクノロジー株式会社", note: "受付は開始15分前。履歴書を1部持参する。", startDate: "2026-07-16", endDate: "2026-07-16", isAllDay: false, startTime: "13:00", endTime: "14:00", category: "interview", isOnline: false },
  { id: 2, title: "内定者面談（予定）", company: "青山テクノロジー株式会社", note: "最終面接の結果に応じて日程が確定する。", startDate: "2026-07-30", endDate: "2026-07-30", isAllDay: false, startTime: "11:00", endTime: "12:00", category: "chat", isOnline: true },
];

export const initialDocuments: CompanyDocument[] = [
  {
    id: 1,
    position: 1,
    title: "企業研究メモ",
    text: `# 企業研究

## 強み

- 自社プロダクトの継続率が高い
- 若手の裁量が大きい

## 確認したいこと

配属決定のプロセスについて質問する。`,
  },
  {
    id: 2,
    position: 2,
    title: "面接対策",
    text: `# 最終面接

## 志望動機

顧客課題に長期的に向き合える点に魅力を感じた。

## 逆質問

- 今後注力するプロダクト領域
- 評価制度とキャリアパス`,
  },
];

export const initialSelectionTracks: Selection[] = [
  {
    id: 1,
    title: "本選考",
    isActive: true,
    steps: [
      { id: 1, stepNo: 1, title: "書類選考", heldAt: "2026-06-10", note: "ES・履歴書を提出", status: "passed" },
      { id: 2, stepNo: 2, title: "適性検査", heldAt: "2026-06-18", note: "Web受検", status: "passed" },
      { id: 3, stepNo: 3, title: "一次面接", heldAt: "2026-06-27", note: "現場マネージャー2名", status: "passed" },
      { id: 4, stepNo: 4, title: "最終面接", heldAt: "2026-07-16", note: "役員面接。履歴書を持参する。", status: "not_started" },
    ],
  },
  {
    id: 2,
    title: "サマーインターン",
    isActive: false,
    steps: [
      { id: 5, stepNo: 1, title: "参加者選考", heldAt: "2025-07-15", note: "オンライン面接", status: "passed" },
      { id: 6, stepNo: 2, title: "3daysインターン", heldAt: "2025-08-20", note: "新規事業立案ワーク", status: "passed" },
    ],
  },
];
