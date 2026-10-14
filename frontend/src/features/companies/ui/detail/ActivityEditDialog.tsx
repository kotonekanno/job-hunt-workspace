import { useState } from 'react';
import type { CompanyActivity } from '@/features/companies/model/activity';
import type { ActivityEditField } from '@/features/companies/ui/detail/ActivityMessageMenu';
import { EditDialog } from '@/shared/dialog';

const labels = { text: 'メッセージ', sentAt: '日時' };

export function ActivityEditDialog({
  activity,
  field,
  onSave,
  onClose,
}: {
  activity: CompanyActivity;
  field: ActivityEditField;
  onSave: (activity: CompanyActivity) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(activity.text);
  const [sentAt] = useState(() => {
    const date = new Date(activity.sentAt);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const inputStyle =
    'mt-2 w-full border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';
  return (
    <EditDialog
      title={`${labels[field]}を編集`}
      submitText="保存する"
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        if (field === 'text' && !text.trim()) return;
        const patch =
          field === 'text'
            ? { text: text.trim() }
            : {
                sentAt: new Date(
                  String(new FormData(event.currentTarget).get('sentAt')),
                ).toISOString(),
              };
        onSave({ ...activity, ...patch });
        onClose();
      }}
    >
      <label className="block text-xs text-[var(--muted)]">
        {labels[field]}
        {field === 'text' && (
          <textarea
            autoFocus
            required
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            className={inputStyle}
          />
        )}
        {field === 'sentAt' && (
          <input
            autoFocus
            required
            type="datetime-local"
            name="sentAt"
            defaultValue={sentAt}
            className={inputStyle}
          />
        )}
      </label>
    </EditDialog>
  );
}
