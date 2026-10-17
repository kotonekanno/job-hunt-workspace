import { useRef, useState } from 'react';
import type { Activity } from '@/api/generated/models/activity';
import type { ActivityEditField } from '@/features/companies/ui/detail/ActivityMessageMenu';
import { EditDialog } from '@/shared/dialog';

const labels = { text: 'メッセージ', sentAt: '日時' };

export function ActivityEditDialog({
  activity,
  field,
  onSave,
  onClose,
}: {
  activity: Activity;
  field: ActivityEditField;
  onSave: (activity: Activity) => Promise<boolean>;
  onClose: () => void;
}) {
  const [text, setText] = useState(activity.text);
  const [sentAt] = useState(() => {
    const date = new Date(activity.occurredAt);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const inputStyle =
    'mt-2 w-full border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';
  const saving = useRef(false);
  return (
    <EditDialog
      title={`${labels[field]}を編集`}
      submitText="保存する"
      onClose={onClose}
      onSubmit={async (event) => {
        event.preventDefault();
        if (saving.current || (field === 'text' && !text.trim())) return;
        const patch =
          field === 'text'
            ? { text: text.trim() }
            : {
                occurredAt: new Date(
                  String(new FormData(event.currentTarget).get('sentAt')),
                ).toISOString(),
              };
        saving.current = true;
        try {
          if (await onSave({ ...activity, ...patch })) onClose();
        } finally {
          saving.current = false;
        }
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
            maxLength={500}
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
