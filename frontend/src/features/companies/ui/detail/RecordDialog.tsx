import { EditDialog } from "@/shared/dialog";
import { useState, type FormEvent } from "react";

type RecordDialogProps = {
  title: string;
  labelName: string;
  valueName: string;
  valueType?: "text" | "url";
  onClose: () => void;
  onSave: (label: string, value: string) => void;
  initialLabel?: string;
  initialValue?: string;
  submitText?: string;
};

export function RecordDialog({
  title,
  labelName,
  valueName,
  valueType,
  onClose,
  onSave,
  initialLabel = "",
  initialValue = "",
  submitText,
}: RecordDialogProps) {
  const [label, setLabel] = useState(initialLabel);
  const [value, setValue] = useState(initialValue);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(label, value);
    onClose();
  }

  return (
    <EditDialog
      title={title}
      submitText={submitText}
      onClose={onClose}
      onSubmit={submit}
    >
        <>
          <label className="block text-xs text-[var(--muted)]">
            {labelName}
            <input
              required
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="block text-xs text-[var(--muted)]">
            {valueName}
            <input
              required
              type={valueType ?? "text"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>
        </>
    </EditDialog>
  );
}
