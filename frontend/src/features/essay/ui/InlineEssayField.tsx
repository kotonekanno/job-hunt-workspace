import { Pencil } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { InlineEditActions } from '@/shared/InlineEditActions';
import { InlineTextarea } from '@/shared/InlineTextarea';

export function InlineEssayField({
  label,
  value,
  onSave,
  children,
  action,
  maxLength,
  allowEmpty = false,
}: {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  children: ReactNode;
  action?: ReactNode;
  maxLength: number;
  allowEmpty?: boolean;
}) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <section className="border-b border-[var(--line)] p-4 last:border-b-0">
      <div className="flex h-8 items-center justify-between gap-3">
        <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[var(--accent)]">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {editing ? (
            <InlineEditActions
              saveLabel={`${label}を保存`}
              cancelLabel={`${label}の編集をキャンセル`}
              disabled={saving || (!allowEmpty && !draft.trim())}
              onSave={async () => {
                setSaving(true);
                setError('');
                try {
                  await onSave(draft.trim());
                  setEditing(false);
                } catch {
                  setError('保存できませんでした。');
                } finally {
                  setSaving(false);
                }
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              {action}
              <button
                type="button"
                aria-label={`${label}を編集`}
                onClick={() => {
                  setHeight(
                    contentRef.current?.getBoundingClientRect().height ?? 28,
                  );
                  setDraft(value);
                  setEditing(true);
                }}
                className="flex size-8 cursor-pointer items-center justify-center text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              >
                <Pencil className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-500">
          {error}
        </p>
      )}
      <div ref={contentRef} className="mt-2">
        {editing ? (
          <InlineTextarea
            initialHeight={height}
            autoFocus
            disabled={saving}
            maxLength={maxLength}
            aria-label={label}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setEditing(false);
            }}
            className="block min-h-0 w-full resize-none overflow-hidden border-0 bg-[var(--panel-raised)] p-0 text-sm font-normal leading-7 text-[var(--text)] outline outline-1 outline-[var(--accent)]"
          />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
