import type { CreateCompanyRequest } from '@/api/generated/models';
import { useRef, useState, type FormEvent } from 'react';
import {
  priorities,
  secondaryPriorities,
  type CompanyPriority,
} from '@/features/companies/model/companyList';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';
import { Select, type SelectOption } from '@/shared/select';

type CompanyCreateDialogProps = {
  onClose: () => void;
  onSave: (company: CreateCompanyRequest) => Promise<void>;
};

export function CompanyCreateDialog(props: CompanyCreateDialogProps) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<CompanyPriority>(3);

  const savingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setError('');
    try {
      await props.onSave({ name, priority });
      props.onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : '企業を追加できませんでした。',
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  const fieldClassName =
    'mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';
  const priorityOptions: SelectOption<CompanyPriority>[] = [
    ...priorities.map((item) => ({
      value: item,
      label: `第${item}志望`,
    })),
    ...secondaryPriorities.map((item) => ({
      value: item,
      label: item === 6 ? '未分類' : 'アーカイブ',
    })),
  ];

  return (
    <EditDialog
      title="企業を追加"
      subTitle="// COMPANY_EDITOR"
      onClose={props.onClose}
      onSubmit={submit}
      submitText={isSaving ? '追加中…' : '追加する'}
    >
      <>
        {error && (
          <p role="alert" className="text-sm text-rose-500">
            {error}
          </p>
        )}
        <label className="block text-xs text-[var(--muted)]">
          会社名
          <RequiredMark />
          <input
            required
            maxLength={50}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClassName}
          />
        </label>
        <label className="block text-xs text-[var(--muted)]">
          志望順位
          <Select
            value={priority}
            options={priorityOptions}
            onValueChange={setPriority}
            className="mt-1 h-10 w-full"
          />
        </label>
      </>
    </EditDialog>
  );
}
