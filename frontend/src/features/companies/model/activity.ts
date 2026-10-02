export type ActivitySender = 'user' | 'company';

export type CompanyActivity = {
  id: string;
  sender: ActivitySender;
  text: string;
  sentAt: string;
};

export const initialActivities: CompanyActivity[] = [
  {
    id: '1',
    sender: 'company',
    text: 'レバテック上でスカウト',
    sentAt: '2026-07-08T10:30:00+09:00',
  },
  {
    id: '2',
    sender: 'user',
    text: '履歴書を提出',
    sentAt: '2026-07-08T12:15:00+09:00',
  },
  {
    id: '3',
    sender: 'company',
    text: '書類選考通過・面接日程の調整依頼',
    sentAt: '2026-07-09T09:00:00+09:00',
  },
  {
    id: '4',
    sender: 'user',
    text: '面接候補日程を送信',
    sentAt: '2026-07-09T09:42:00+09:00',
  },
];
