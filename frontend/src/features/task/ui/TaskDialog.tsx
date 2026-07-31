import { useState, type FormEvent } from "react";
import { companyNameOptions } from "@/features/companies/model/companyList";
import type { Task } from "@/features/task/model/task";
import { CompanyCombobox } from "@/shared/CompanyCombobox";
import { EditDialog } from "@/shared/dialog";
import { RequiredMark } from "@/shared/form";

type TaskDialogProps = {
  task?: Task;
  defaultCompany?: string;
  onClose: () => void;
  onSave: (task: Task) => void;
};

export function TaskDialog({
  task,
  defaultCompany,
  onClose,
  onSave,
}: TaskDialogProps) {
  const [form, setForm] = useState<Task>(() => task
    ? {
        ...task,
        company: task.company ?? defaultCompany,
      }
    : {
        id: Date.now(),
        title: "",
        description: "",
        dueDate: undefined,
        company: defaultCompany,
        completed: false,
      });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(form);
    onClose();
  }

  const fieldClassName = "mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]";

  const fields = (
    <>
      <label className="text-xs text-[var(--muted)]">
        企業名
        <CompanyCombobox
          value={form.company ?? ""}
          options={companyNameOptions}
          allowEmpty
          onValueChange={(company) => setForm({
            ...form,
            company: company || undefined,
          })}
          className="mt-1"
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        期限
        <input
          type="date"
          value={form.dueDate ?? ""}
          onChange={(event) => setForm({
            ...form,
            dueDate: event.target.value || undefined,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)] sm:col-span-2">
        タイトル
        <RequiredMark />
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

      <label className="text-xs text-[var(--muted)] sm:col-span-2">
        詳細
        <textarea
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
      title={task ? "タスクを編集" : "タスクを追加"}
      subTitle="// TASK_EDITOR"
      onClose={onClose}
      onSubmit={submit}
      submitText={task ? "保存する" : "追加する"}
      formClassName="max-w-xl p-6 sm:p-8"
      fieldsClassName="mt-5 grid gap-4 sm:grid-cols-2"
      titleClassName="text-lg"
    >
      {fields}
    </EditDialog>
  );
}
