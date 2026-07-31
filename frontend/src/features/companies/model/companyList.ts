import type { currentSelection } from "@/features/companies/model/selection";

export type CompanyPriority =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export type CompanyListItem = {
  id: number;
  name: string;
  priority: CompanyPriority;
  order: number;
  selection: currentSelection;
};

export const priorities: CompanyPriority[] = [1, 2, 3, 4, 5];

export const secondaryPriorities: CompanyPriority[] = [
  6,
  0,
];

export const initialCompanyList: CompanyListItem[] = [
  { id: 1, name: "青山テクノロジー株式会社", priority: 1, order: 1, selection: { title: "本選考", step: "最終面接", status: "pending" } },
  { id: 2, name: "株式会社ネクスト", priority: 1, order: 2, selection: { title: "本選考", step: "二次面接", status: "pending" } },
  { id: 3, name: "星野デジタル", priority: 2, order: 1, selection: { title: "サマーインターン", step: "一次面接", status: "not_started" } },
  { id: 4, name: "北斗システムズ", priority: 2, order: 2, selection: { title: "本選考", step: "適性検査", status: "pending" } },
  { id: 5, name: "クラフトワークス", priority: 3, order: 1, selection: { title: "本選考", step: "書類選考", status: "not_started" } },
  { id: 6, name: "東都ファイナンス", priority: 4, order: 1, selection: { title: "本選考", step: "筆記試験", status: "not_started" } },
  { id: 7, name: "港データラボ", priority: 5, order: 1, selection: { title: "本選考", step: "書類選考", status: "not_started" } },
  { id: 8, name: "中央ビジネスパートナーズ", priority: 6, order: 1, selection: { title: "秋季インターン", step: "エントリー", status: "not_started" } },
  { id: 9, name: "西東京ソリューションズ", priority: 0, order: 1, selection: { title: "本選考", step: "最終面接", status: "failed" } },
];

export const companyNameOptions = initialCompanyList.map(
  (company) => company.name,
);
