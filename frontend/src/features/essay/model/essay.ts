export type EssayGroup = {
  id: string;
  position: number;
  name: string;
};

export type Essay = {
  id: number;
  company: string;
  groupId: string;
  question: string;
  answer: string;
};

export const initialEssayGroups: EssayGroup[] = [
  { id: "motivation", position: 1, name: "志望動機" },
  { id: "strengths", position: 2, name: "長所" },
  { id: "gakuchika", position: 3, name: "ガクチカ" },
  { id: "research", position: 4, name: "研究" },
  { id: "unclassified", position: 5, name: "未分類" },
];

export const unclassifiedEssayGroupId = "unclassified";

export const initialEssays: Essay[] = [
  {
    id: 1,
    company: "株式会社ネクスト",
    groupId: "gakuchika",
    question: "学生時代に最も力を入れたことを教えてください。",
    answer: "大学祭実行委員会で、来場者向け企画の責任者を務めました。前年のアンケートを分析し、待ち時間の長さが満足度を下げていると考え、整理券のオンライン化を提案しました。メンバーと役割を分担して実装と当日の運用を行い、平均待ち時間を約30％短縮しました。",
  },
  {
    id: 2,
    company: "青山テクノロジー株式会社",
    groupId: "strengths",
    question: "あなたの長所と、それが発揮された経験を教えてください。",
    answer: "私の長所は、課題を整理し、周囲を巻き込みながら改善を続けられることです。アルバイト先では新人向けの手順が属人化していたため、スタッフへの聞き取りをもとにチェックリストを作成し、研修期間の短縮につなげました。",
  },
  {
    id: 3,
    company: "北斗システムズ",
    groupId: "motivation",
    question: "当社を志望する理由を400字以内で記述してください。",
    answer: "貴社が業界横断で業務改善に取り組み、技術の導入だけでなく定着まで支援している点に魅力を感じています。大学で情報システムを学ぶ中で、利用者の理解と運用設計が成果を左右すると実感しました。相手の課題を丁寧に捉える力を生かし、顧客と共に価値を作る仕事に携わりたいと考えています。",
  },
  {
    id: 4,
    company: "星野デジタル",
    groupId: unclassifiedEssayGroupId,
    question: "これまでに経験した失敗と、そこから学んだことを教えてください。",
    answer: "ゼミ発表の準備で完成度を重視するあまり、メンバーへの共有が遅れた経験があります。以降は早い段階でたたき台を共有し、短い周期で意見を反映する進め方に変えました。現在は、質を高めるためにも早期の共有が重要だと考えています。",
  },
];
