import { useRef, useState, type FormEvent } from 'react';
import { EditDialog } from '@/shared/dialog';
import { RequiredMark } from '@/shared/form';

type EssayGroupDialogProps = {
  onClose: () => void;
  onSave: (name: string) => void | Promise<boolean>;
  groupName?: string;
};

export function EssayGroupDialog({
  onClose,
  onSave,
  groupName,
}: EssayGroupDialogProps) {
  const [name, setName] = useState(groupName ?? '');

  const saving = useRef(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || saving.current) return;
    saving.current = true;
    try {
      if ((await onSave(name.trim())) !== false) onClose();
    } finally {
      saving.current = false;
    }
  }

  return (
    <EditDialog
      title={groupName ? 'ジャンル名を編集' : '新しいジャンルを追加'}
      subTitle="QUESTION GENRE"
      submitText={groupName ? '変更する' : '追加する'}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--text-strong)]">
          ジャンル名
          <RequiredMark />
        </span>
        <input
          autoFocus
          required
          maxLength={50}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例：研究、アルバイト"
          className="mt-2 h-10 w-full cursor-text border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--faint)] hover:border-[var(--line-strong)] focus:border-[var(--accent)]"
        />
      </label>
    </EditDialog>
  );
}
