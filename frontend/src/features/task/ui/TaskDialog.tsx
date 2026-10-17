import { useRef, useState, type FormEvent } from 'react';
import type { Task } from '@/api/generated/models/task';
import type { TaskForm } from '@/features/task/model/task';
import { CompanyCombobox } from '@/shared/CompanyCombobox';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

type TaskDialogProps = {
  task?: Task;
  defaultCompany?: string;
  companyOptions: readonly string[];
  onClose: () => void;
  onSave: (task: TaskForm) => void | Promise<boolean>;
};

export function TaskDialog({
  task,
  defaultCompany,
  companyOptions,
  onClose,
  onSave,
}: TaskDialogProps) {
  const [form, setForm] = useState<TaskForm>(() =>
    task
      ? {
          ...task,
          companyName: task.companyName ?? defaultCompany,
        }
      : {
          title: '',
          note: '',
          deadline: null,
          companyName: defaultCompany,
          done: false,
        },
  );

  const saving = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    try {
      if ((await onSave(form)) !== false) onClose();
    } finally {
      saving.current = false;
    }
  }

  const fieldClassName =
    'mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';

  const fields = (
    <>
      <label className="text-xs text-[var(--muted)]">
        企業名
        <CompanyCombobox
          value={form.companyName ?? ''}
          options={companyOptions}
          allowEmpty
          onValueChange={(company) =>
            setForm({
              ...form,
              companyName: company || undefined,
            })
          }
          className="mt-1"
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        期限
        <input
          type="date"
          value={form.deadline ?? ''}
          onChange={(event) =>
            setForm({
              ...form,
              deadline: event.target.value || null,
            })
          }
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)] sm:col-span-2">
        タイトル
        <RequiredMark />
        <input
          required
          maxLength={200}
          value={form.title}
          onChange={(event) =>
            setForm({
              ...form,
              title: event.target.value,
            })
          }
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)] sm:col-span-2">
        詳細
        <textarea
          maxLength={2000}
          value={form.note ?? ''}
          onChange={(event) =>
            setForm({
              ...form,
              note: event.target.value,
            })
          }
          className="mt-1 min-h-28 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </label>
    </>
  );

  return (
    <EditDialog
      title={task ? 'タスクを編集' : 'タスクを追加'}
      subTitle="// TASK_EDITOR"
      onClose={onClose}
      onSubmit={submit}
      submitText={task ? '保存する' : '追加する'}
      formClassName="max-w-xl p-6 sm:p-8"
      fieldsClassName="mt-5 grid gap-4 sm:grid-cols-2"
      titleClassName="text-lg"
    >
      {fields}
    </EditDialog>
  );
}
