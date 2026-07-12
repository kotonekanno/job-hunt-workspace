import { CancelButton, ColoredSubmitButton } from "@/shared/button";
import { X } from "lucide-react";
import { useState, type FormEvent } from "react";

type RecordDialogProps = {
  title: string;
  labelName: string;
  valueName: string;
  valueType?: "text" | "url";
  onClose: () => void;
  onSave: (label: string, value: string) => void;
};

export function RecordDialog(props: RecordDialogProps) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSave(label, value);
    props.onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm"
      onMouseDown={props.onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="cyber-cut w-full max-w-md border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <h2 className="text-base font-bold text-[var(--text-strong)]">
            {props.title}
          </h2>
          <button type="button" onClick={props.onClose}>
            <X className="size-4 text-[var(--muted)]" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-xs text-[var(--muted)]">
            {props.labelName}
            <input
              required
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="block text-xs text-[var(--muted)]">
            {props.valueName}
            <input
              required
              type={props.valueType ?? "text"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <CancelButton
            onClick={props.onClose}
          />
          <ColoredSubmitButton text="追加する" />
        </div>
      </form>
    </div>
  );
}
