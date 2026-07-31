import {
  useState,
  type FormEvent,
} from "react";
import { EditDialog } from "@/shared/dialog";
import { RequiredMark } from "@/shared/form";

type DocumentCreateDialogProps = {
  onClose: () => void;
  onCreate: (title: string) => void;
};

export function DocumentCreateDialog({
  onClose,
  onCreate,
}: DocumentCreateDialogProps) {
  const [title, setTitle] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    onCreate(normalizedTitle);
    onClose();
  }

  return (
    <EditDialog
      title="書類を追加"
      subTitle="// DOCUMENT_CREATE"
      submitText="追加する"
      onClose={onClose}
      onSubmit={submit}
    >
      <label className="block text-xs text-[var(--muted)]">
        タイトル
        <RequiredMark />

        <input
          autoFocus
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
          placeholder="例：一次面接対策"
        />
      </label>
    </EditDialog>
  );
}
