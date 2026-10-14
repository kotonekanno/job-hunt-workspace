import { useState, type FormEvent } from 'react';
import { useCompanyOptions } from '@/features/companies/hooks/useCompanyOptions';
import type { CreateTaskRequest } from '@/api/generated/models';
import type { Task } from '@/features/task/model/task';
import { CompanyCombobox } from '@/shared/CompanyCombobox';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

type TaskDialogProps = {
  task?: Task;
  defaultCompany?: string;
  onClose: () => void;
  onSave: (request: CreateTaskRequest, companyName?: string) => Promise<void>;
  fixedCompanyId?: number;
};

export function TaskDialog({
  task,
  defaultCompany,
  onClose,
  onSave,
  fixedCompanyId,
}: TaskDialogProps) {
  const options = useCompanyOptions();
  const [company, setCompany] = useState(
    task?.companyName ?? defaultCompany ?? '',
  );
  const [form, setForm] = useState<CreateTaskRequest>({
    title: task?.title ?? '',
    note: task?.note ?? '',
    deadline: task?.deadline ?? null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || options.isLoading || options.error) return;
    const selected = options.companies.find((item) => item.name === company);
    if (
      company &&
      !selected &&
      fixedCompanyId === undefined &&
      company !== (task?.companyName ?? '')
    ) {
      setError('企業一覧から企業を選択してください。');
      return;
    }
    const originalCompany = task?.companyName ?? '';
    const request: CreateTaskRequest = {
      ...form,
      title: form.title.trim(),
      companyId:
        task && company === originalCompany
          ? undefined
          : (fixedCompanyId ?? selected?.id ?? null),
    };
    setIsSaving(true);
    setError('');
    try {
      await onSave(request, company || undefined);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '保存できませんでした。',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const fieldClassName =
    'mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';

  const fields = (
    <>
      {(error || options.error) && (
        <p role="alert" className="text-sm text-rose-500 sm:col-span-2">
          {error || options.error}
        </p>
      )}
      {fixedCompanyId !== undefined ? (
        <label className="text-xs text-[var(--muted)]">
          企業名
          <input
            value={defaultCompany ?? company}
            readOnly
            className={fieldClassName}
          />
        </label>
      ) : (
        <label className="text-xs text-[var(--muted)]">
          企業名
          <CompanyCombobox
            value={company}
            options={options.companies.map((item) => item.name)}
            allowEmpty
            onValueChange={setCompany}
            className="mt-1"
          />
        </label>
      )}

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
      submitText={isSaving ? '保存中…' : task ? '保存する' : '追加する'}
      formClassName="max-w-xl p-6 sm:p-8"
      fieldsClassName="mt-5 grid gap-4 sm:grid-cols-2"
      titleClassName="text-lg"
    >
      {fields}
    </EditDialog>
  );
}
