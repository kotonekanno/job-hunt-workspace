import { useState, type FormEvent, type KeyboardEvent } from 'react';
import type { CompanyPriority } from '@/api/generated/models/companyPriority';
import type {
  CurrentSelection,
  SelectionStatus,
} from '@/features/companies/model/selection';
import { EditIconButton } from '@/shared/button';
import { InlineEditActions } from '@/shared/InlineEditActions';
import { PriorityBadge } from '../priority-badge';
import { SelectionStepBadge } from '../selection-step-badge';

export function CompanyHeader({
  name,
  priority,
  onNameSave,
  onPriorityChange,
  selection,
  onResultChange,
}: {
  name: string;
  priority: CompanyPriority;
  onNameSave: (name: string) => Promise<boolean>;
  onPriorityChange: (priority: CompanyPriority) => void;
  selection?: CurrentSelection;
  onResultChange: (result: SelectionStatus) => void;
}) {
  const companyName = name;
  const [draftName, setDraftName] = useState(name);
  const [isEditingName, setIsEditingName] = useState(false);
  function startEditingName() {
    setDraftName(companyName);
    setIsEditingName(true);
  }

  async function saveCompanyName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = draftName.trim();

    if (!nextName) return;

    if (!(await onNameSave(nextName))) return;
    setDraftName(nextName);
    setIsEditingName(false);
  }

  function cancelEditingName() {
    setDraftName(companyName);
    setIsEditingName(false);
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditingName();
    }
  }

  return (
    <header className="ui-panel cyber-cut flex flex-wrap items-center gap-4 border border-[var(--line)] p-5 sm:p-6">
      <PriorityBadge
        priority={priority === 6 ? 0 : priority === 7 ? 6 : priority}
        size="m"
        onChange={(value) => {
          const next =
            value === 0 || value === null ? 6 : value === 6 ? 7 : value;
          if (next >= 1 && next <= 7) onPriorityChange(next);
        }}
      />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isEditingName ? (
          <form
            onSubmit={saveCompanyName}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <input
              autoFocus
              maxLength={50}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={handleNameKeyDown}
              aria-label="企業名を編集"
              className="min-w-0 flex-1 border-0 border-b border-[var(--accent)] bg-transparent p-0 text-xl font-black text-[var(--text-strong)] outline-none sm:text-2xl"
            />

            <InlineEditActions
              disabled={!draftName.trim()}
              saveLabel="企業名を保存"
              cancelLabel="企業名の編集をキャンセル"
              onCancel={cancelEditingName}
            />
          </form>
        ) : (
          <>
            <h1 className="truncate text-xl font-black text-[var(--text-strong)] sm:text-2xl">
              {companyName}
            </h1>
            <EditIconButton
              size="m"
              transparent={false}
              ariaLabel="企業名を編集"
              onClick={startEditingName}
            />
          </>
        )}
      </div>

      {selection && (
        <SelectionStepBadge
          title={selection.title}
          step={selection.step}
          result={selection.status}
          size="l"
          onResultChange={onResultChange}
        />
      )}
    </header>
  );
}
