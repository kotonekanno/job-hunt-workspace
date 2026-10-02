export type WorkspaceDocument = {
  id: number;
  position: number;
  title: string;
  text: string;
};

export const initialWorkspaceDocuments: WorkspaceDocument[] = [
  {
    id: 1,
    position: 1,
    title: "就活プラン",
    text: `# 就活プラン

## 今月の目標

- 志望企業を10社に絞る
- 面接の想定質問を整理する
- 週に2日は企業研究の時間を確保する

## 振り返り

毎週日曜日に応募状況と次週の優先順位を見直す。`,
  },
  {
    id: 2,
    position: 2,
    title: "面接対策",
    text: `# 面接対策

## よく聞かれる質問

- 自己紹介
- 学生時代に力を入れたこと
- 志望動機
- 入社後に取り組みたいこと

## 意識すること

結論から話し、具体的な経験を添える。`,
  },
  {
    id: 3,
    position: 3,
    title: "自己分析メモ",
    text: `# 自己分析

## 大切にしたいこと

利用者の反応を近くで確認しながら、継続的に改善できる環境で働きたい。

## 得意なこと

曖昧な課題を整理し、小さな作業へ分解すること。`,
  },
];
