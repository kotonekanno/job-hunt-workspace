import type { Selection } from './selection';

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

export const initialSelectionTracks: Selection[] = [
  {
    id: 1,
    title: '本選考',
    isActive: true,
    currentStep: 4,
    steps: [
      {
        id: 1,
        stepNo: 1,
        title: '書類選考',
        heldAt: '2026-06-10',
        note: 'ES・履歴書を提出',
        status: 'passed',
      },
      {
        id: 2,
        stepNo: 2,
        title: '適性検査',
        heldAt: '2026-06-18',
        note: 'Web受検',
        status: 'passed',
      },
      {
        id: 3,
        stepNo: 3,
        title: '一次面接',
        heldAt: '2026-06-27',
        note: '現場マネージャー2名',
        status: 'passed',
      },
      {
        id: 4,
        stepNo: 4,
        title: '最終面接',
        heldAt: '2026-07-16',
        note: '役員面接。履歴書を持参する。',
        status: 'not_started',
      },
    ],
  },
  {
    id: 2,
    title: 'サマーインターン',
    isActive: false,
    currentStep: 6,
    steps: [
      {
        id: 5,
        stepNo: 1,
        title: '参加者選考',
        heldAt: '2025-07-15',
        note: 'オンライン面接',
        status: 'passed',
      },
      {
        id: 6,
        stepNo: 2,
        title: '3daysインターン',
        heldAt: '2025-08-20',
        note: '新規事業立案ワーク',
        status: 'passed',
      },
    ],
  },
];
