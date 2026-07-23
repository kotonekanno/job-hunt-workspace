import type { CalendarEvent } from "@/features/calendar/model/calendar";

export type WidgetType =
  | "basic-info"
  | "links"
  | "tasks"
  | "events"
  | "documents"
  | "selection"
  | "memo";

export type SelectionResult =
  | "not_started" // 未受験
  | "pending"     // 結果待ち
  | "passed"      // 合格
  | "failed";     // 不合格

export type SelectionStep = {
  id: number;
  name: string;
  date?: string;
  memo: string;
  result: SelectionResult;
};

export type SelectionTrack = {
  id: number;
  name: string;
  steps: SelectionStep[];
};

export type CompanyDocument = {
  id: number;
  title: string;
  updatedAt: string;
  content: string;
};

export const widgetLabels: Record<WidgetType, string> = {
  "basic-info": "基本情報",
  links: "関連リンク集",
  tasks: "関連タスク",
  events: "関連イベント",
  documents: "テキスト",
  selection: "選考状況",
  memo: "メモ",
};

export const widgetOrder: WidgetType[] = [
  "documents",
  "basic-info",
  "memo",
  "selection",
  "links",
  "events",
  "tasks",
];

export const companyProfile = {
  name: "青山テクノロジー株式会社",
  selectionType: "本選考",
  selectionStep: "最終面接",
  selectionResult: "pending" as SelectionResult,
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
  { id: 1, title: "最終面接", company: "青山テクノロジー株式会社", date: "2026-07-16", time: "13:00", category: "面接", location: "東京本社", format: "オフライン", status: "参加確定", memo: "受付は開始15分前。履歴書を1部持参する。" },
  { id: 2, title: "内定者面談（予定）", company: "青山テクノロジー株式会社", date: "2026-07-30", time: "11:00", category: "カジュアル面談", location: "Google Meet", format: "オンライン", status: "不確定", memo: "最終面接の結果に応じて日程が確定する。" },
];

export const initialDocuments: CompanyDocument[] = [
  {
    id: 1,
    title: "企業研究メモ",
    updatedAt: "2026-07-11",
    content: `# 企業研究

## 強み

- 自社プロダクトの継続率が高い
- 若手の裁量が大きい

## 確認したいこと

配属決定のプロセスについて質問する。`,
  },
  {
    id: 2,
    title: "面接対策",
    updatedAt: "2026-07-12",
    content: `# 最終面接

## 志望動機

顧客課題に長期的に向き合える点に魅力を感じた。

## 逆質問

- 今後注力するプロダクト領域
- 評価制度とキャリアパス`,
  },
];

export const initialSelectionTracks: SelectionTrack[] = [
  {
    id: 1,
    name: "本選考",
    steps: [
      { id: 1, name: "書類選考", date: "2026-06-10", memo: "ES・履歴書を提出", result: "passed" },
      { id: 2, name: "適性検査", date: "2026-06-18", memo: "Web受検", result: "passed" },
      { id: 3, name: "一次面接", date: "2026-06-27", memo: "現場マネージャー2名", result: "passed" },
      { id: 4, name: "最終面接", date: "2026-07-16", memo: "役員面接。履歴書を持参する。", result: "not_started" },
    ],
  },
  {
    id: 2,
    name: "サマーインターン",
    steps: [
      { id: 5, name: "参加者選考", date: "2025-07-15", memo: "オンライン面接", result: "passed" },
      { id: 6, name: "3daysインターン", date: "2025-08-20", memo: "新規事業立案ワーク", result: "passed" },
    ],
  },
];
