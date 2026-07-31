import { useState, type FormEvent } from "react";
import {
  priorities,
  secondaryPriorities,
  type CompanyListItem,
  type CompanyPriority,
} from "@/features/companies/model/companyList";
import { EditDialog } from "@/shared/dialog";
import { RequiredMark } from "@/shared/form";
import { Select, type SelectOption } from "@/shared/select";

type CompanyCreateDialogProps = {
  onClose: () => void;
  onSave: (company: Omit<CompanyListItem, "id">) => void;
};

export function CompanyCreateDialog(props: CompanyCreateDialogProps) {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<CompanyPriority>(3);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSave({
      name,
      priority,
      progress: "未応募",
      selectionType: "本選考",
      currentStep: "書類選考",
      selectionResult: "not_started",
      pendingTasks: 0,
    });
    props.onClose();
  }

  const fieldClassName = "mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]";
  const priorityOptions: SelectOption<CompanyPriority>[] = [
    ...priorities.map((item) => ({
      value: item,
      label: `第${item}志望`,
    })),
    ...secondaryPriorities.map((item) => ({
      value: item,
      label: item === 0 ? "未分類" : "アーカイブ",
    })),
  ];

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
