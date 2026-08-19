export type Task = {
  id: number;
  title: string;
  note: string;
  deadline?: string;
  company?: string;
  done: boolean;
};

export const initialTasks: Task[] = [
  { id: 1, title: "最終面接の想定質問を整理する", note: "志望動機、入社後に取り組みたいこと、逆質問をそれぞれ3つずつ準備する。", deadline: "2026-07-15", company: "青山テクノロジー株式会社", done: false },
  { id: 2, title: "適性検査を受検する", note: "受検URLを確認し、静かな環境で時間に余裕を持って開始する。", deadline: "2026-07-18", company: "北斗システムズ", done: false },
  { id: 3, title: "エントリーシートを提出する", note: "誤字脱字と文字数を最終確認してからマイページより提出する。", deadline: "2026-07-20", company: "株式会社ネクスト", done: true },
  { id: 4, title: "業界研究ノートを更新する", note: "各社の事業領域、競合、最近のニュースを比較表へ追記する。", done: false },
  { id: 5, title: "座談会のお礼メールを送る", note: "当日聞いた話の中で印象に残った内容を一言添える。", deadline: "2026-07-13", company: "星野デジタル", done: true },
];
