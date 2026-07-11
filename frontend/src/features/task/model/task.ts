export type Task = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  company?: string;
  completed: boolean;
};

export type TaskSort = "手動" | "期限が近い順" | "企業名順";

export const initialTasks: Task[] = [
  { id: 1, title: "最終面接の想定質問を整理する", description: "志望動機、入社後に取り組みたいこと、逆質問をそれぞれ3つずつ準備する。", dueDate: "2026-07-15", company: "青山テクノロジー", completed: false },
  { id: 2, title: "適性検査を受検する", description: "受検URLを確認し、静かな環境で時間に余裕を持って開始する。", dueDate: "2026-07-18", company: "北斗システムズ", completed: false },
  { id: 3, title: "エントリーシートを提出する", description: "誤字脱字と文字数を最終確認してからマイページより提出する。", dueDate: "2026-07-20", company: "株式会社ネクスト", completed: true },
  { id: 4, title: "業界研究ノートを更新する", description: "各社の事業領域、競合、最近のニュースを比較表へ追記する。", dueDate: "2026-07-22", completed: false },
  { id: 5, title: "座談会のお礼メールを送る", description: "当日聞いた話の中で印象に残った内容を一言添える。", dueDate: "2026-07-13", company: "星野デジタル", completed: true },
];
