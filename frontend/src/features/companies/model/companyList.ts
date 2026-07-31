import type { CalendarEvent } from "@/features/calendar/model/calendar";
import type { SelectionResult } from "@/features/companies/model/companyDetail";

export type CompanyPriority =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export type CompanyProgress =
  | "未応募"
  | "選考中"
  | "結果待ち"
  | "内定"
  | "終了";

export type CompanyListItem = {
  id: number;
  name: string;
  priority: CompanyPriority;
  progress: CompanyProgress;
  selectionType: string;
  currentStep: string;
  selectionResult: SelectionResult;
  pendingTasks: number;
  nextEvent?: CalendarEvent;
};

export const priorities: CompanyPriority[] = [1, 2, 3, 4, 5];

export const secondaryPriorities: CompanyPriority[] = [
  6,
  0,
];

export const progressOptions: CompanyProgress[] = [
  "未応募",
  "選考中",
  "結果待ち",
  "内定",
  "終了",
];

export const initialCompanyList: CompanyListItem[] = [
  { id: 1, name: "青山テクノロジー株式会社", priority: 1, progress: "選考中", selectionType: "本選考", currentStep: "最終面接", selectionResult: "pending", pendingTasks: 2, nextEvent: { id: 101, title: "最終面接", company: "青山テクノロジー株式会社", date: "2026-07-16", endDate: "2026-07-16", allDay: false, startTime: "13:00", endTime: "14:00", category: "面接", format: "オフライン", memo: "受付は開始15分前。履歴書を1部持参する。" } },
  { id: 2, name: "株式会社ネクスト", priority: 1, progress: "結果待ち", selectionType: "本選考", currentStep: "二次面接", selectionResult: "pending", pendingTasks: 1 },
  { id: 3, name: "星野デジタル", priority: 2, progress: "選考中", selectionType: "サマーインターン", currentStep: "一次面接", selectionResult: "not_started", pendingTasks: 3, nextEvent: { id: 103, title: "エンジニア向け説明会", company: "星野デジタル", date: "2026-07-21", endDate: "2026-07-21", allDay: false, startTime: "16:00", endTime: "17:00", category: "説明会", format: "オンライン", status: "不参加" } },
  { id: 4, name: "北斗システムズ", priority: 2, progress: "結果待ち", selectionType: "本選考", currentStep: "適性検査", selectionResult: "pending", pendingTasks: 1 },
  { id: 5, name: "クラフトワークス", priority: 3, progress: "未応募", selectionType: "本選考", currentStep: "書類選考", selectionResult: "not_started", pendingTasks: 2 },
  { id: 6, name: "東都ファイナンス", priority: 4, progress: "選考中", selectionType: "本選考", currentStep: "筆記試験", selectionResult: "not_started", pendingTasks: 1, nextEvent: { id: 106, title: "筆記試験", company: "東都ファイナンス", date: "2026-07-28", endDate: "2026-07-28", allDay: false, startTime: "09:30", endTime: "11:00", category: "その他", format: "オフライン", status: "参加" } },
  { id: 7, name: "港データラボ", priority: 5, progress: "未応募", selectionType: "本選考", currentStep: "書類選考", selectionResult: "not_started", pendingTasks: 0 },
  { id: 8, name: "中央ビジネスパートナーズ", priority: 6, progress: "未応募", selectionType: "秋季インターン", currentStep: "エントリー", selectionResult: "not_started", pendingTasks: 1 },
  { id: 9, name: "西東京ソリューションズ", priority: 0, progress: "終了", selectionType: "本選考", currentStep: "最終面接", selectionResult: "failed", pendingTasks: 0 },
];

export const companyNameOptions = initialCompanyList.map(
  (company) => company.name,
);
