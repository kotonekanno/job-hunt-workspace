import { RequiredMark } from '@/shared/form';

export function SelectionStepFields({
  title,
  note,
  onChange,
}: {
  title: string;
  note: string;
  onChange: (patch: { title?: string; note?: string }) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-[var(--muted)]">
        選考ステップの名前
        <RequiredMark />
        <input
          required
          value={title}
          onChange={(event) => onChange({ title: event.target.value })}
          className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="block text-xs text-[var(--muted)]">
        メモ
        <textarea
          value={note}
          onChange={(event) => onChange({ note: event.target.value })}
          className="mt-1 min-h-20 w-full resize-y border border-[var(--line)] bg-[var(--panel)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </label>
    </div>
  );
}
