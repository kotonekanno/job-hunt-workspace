import { useState, type FormEvent } from "react";
import type { Task } from "@/features/task/model/task";
import { EditDialog } from "@/shared/dialog";

type TaskDialogProps = {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
};

export function TaskDialog({ task, onClose, onSave }: TaskDialogProps) {
  const [form, setForm] = useState(task);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(form);
    onClose();
  }

  const fieldClassName = "mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]";

  const fields = (
    <>
      <label className="text-xs text-[var(--muted)] sm:col-span-2">
        タスク内容
        <input
          required
          value={form.title}
          onChange={(event) => setForm({
            ...form,
            title: event.target.value,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        期限
        <input
          required
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm({
            ...form,
            dueDate: event.target.value,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        企業名（任意）
        <input
          value={form.company ?? ""}
          onChange={(event) => setForm({
            ...form,
            company: event.target.value || undefined,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)] sm:col-span-2">
        詳細
        <textarea
          required
          value={form.description}
          onChange={(event) => setForm({
            ...form,
            description: event.target.value,
          })}
          className="mt-1 min-h-28 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </label>
    </>
  );

  return (
    <EditDialog
      title="タスクを編集"
      subTitle="// TASK_EDITOR"
      onClose={onClose}
      onSubmit={submit}
      submitText="保存する"
      formClassName="max-w-xl p-6 sm:p-8"
      fieldsClassName="mt-5 grid gap-4 sm:grid-cols-2"
      titleClassName="text-lg"
    >
      {fields}
    </EditDialog>
  );
}
