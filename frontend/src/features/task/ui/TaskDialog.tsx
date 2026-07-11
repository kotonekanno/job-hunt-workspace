import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Task } from "@/features/task/model/task";

type TaskDialogProps = { task: Task; onClose: () => void; onSave: (task: Task) => void };

export function TaskDialog({ task, onClose, onSave }: TaskDialogProps) {
  const [form, setForm] = useState(task);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(form);
    onClose();
  }

  const fieldClassName = "mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} className="cyber-cut w-full max-w-xl border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)] sm:p-8">
        <div className="flex items-start justify-between border-b border-[var(--line)] pb-4"><div><p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">// TASK_EDITOR</p><h2 className="mt-1 text-lg font-bold text-[var(--text-strong)]">タスクを編集</h2></div><button type="button" onClick={onClose} className="flex size-8 items-center justify-center text-[var(--muted)]"><X className="size-4" /></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-[var(--muted)] sm:col-span-2">タスク内容<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)]">期限<input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)]">企業名（任意）<input value={form.company ?? ""} onChange={(event) => setForm({ ...form, company: event.target.value || undefined })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)] sm:col-span-2">詳細<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-28 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-10 border border-[var(--line)] px-5 text-xs font-semibold text-[var(--muted)]">キャンセル</button><button type="submit" className="cyber-cut-sm h-10 bg-[var(--accent)] px-6 text-xs font-bold text-[var(--accent-contrast)]">保存する</button></div>
      </form>
    </div>
  );
}
