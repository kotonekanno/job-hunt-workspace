import { useRef, useState, type FormEvent } from 'react';
import type { CreateCompanyRequest } from '@/api/generated/models/createCompanyRequest';
import type { CompanyPriority } from '@/api/generated/models/companyPriority';
import {
  listPriorities,
  listPriorityLabels,
} from '@/features/companies/lib/companyBoard';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';
import { Select, type SelectOption } from '@/shared/select';

type CompanyCreateDialogProps = {
  onClose: () => void;
  onSave: (company: CreateCompanyRequest) => Promise<boolean>;
};

export function CompanyCreateDialog(props: CompanyCreateDialogProps) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<CompanyPriority>(3);

  const saving = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || saving.current) return;
    saving.current = true;
    try {
      if (await props.onSave({ name: name.trim(), priority })) props.onClose();
    } finally {
      saving.current = false;
    }
  }

  const fieldClassName =
    'mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]';
  const priorityOptions: SelectOption<CompanyPriority>[] = listPriorities.map(
    (value) => ({ value, label: listPriorityLabels[value] }),
  );

  return (
    <EditDialog
      title="企業を追加"
      subTitle="// COMPANY_EDITOR"
      onClose={props.onClose}
      onSubmit={submit}
    >
      <>
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
