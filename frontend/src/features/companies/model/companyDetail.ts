export type WidgetType =
  'basic-info' | 'tasks' | 'events' | 'documents' | 'selection' | 'activities';

export const widgetLabels: Record<WidgetType, string> = {
  'basic-info': '基本情報',
  tasks: '関連タスク',
  events: '関連イベント',
  documents: 'ドキュメント',
  selection: '選考状況',
  activities: 'やりとり履歴',
};

export const widgetOrder: WidgetType[] = [
  'documents',
  'basic-info',
  'selection',
  'activities',
  'events',
  'tasks',
];

// LinksWidget is not connected to a corresponding API in the current schema.
export const companyProfile = {
  links: [
    ['企業サイト', 'https://example.com'],
    ['採用ページ', 'https://example.com/recruit'],
    ['応募者マイページ', 'https://example.com/mypage'],
  ],
};
