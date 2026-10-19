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
