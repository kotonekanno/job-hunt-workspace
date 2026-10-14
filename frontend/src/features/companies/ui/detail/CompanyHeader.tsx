import { useState, type FormEvent, type KeyboardEvent } from 'react';
import type { CompanyPriority } from '@/api/generated/models';
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
  onNameChange,
  onPriorityChange,
  selection,
  onResultChange,
}: {
  name: string;
  priority: CompanyPriority | null;
  onNameChange: (name: string) => Promise<void>;
  onPriorityChange: (priority: CompanyPriority) => Promise<void>;
  selection?: CurrentSelection;
  onResultChange: (result: SelectionStatus) => void;
}) {
  const companyName = name;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
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

    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      if (nextName !== name) await onNameChange(nextName);
      setDraftName(nextName);
      setIsEditingName(false);
    } catch {
      setError('企業名を保存できませんでした。');
    } finally {
      setIsSaving(false);
    }
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
        priority={priority}
        size="m"
        onChange={(next) => {
          if (next !== null && next !== priority)
            void onPriorityChange(next).catch(() =>
              setError('志望度を保存できませんでした。'),
            );
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-rose-500">
          {error}
        </p>
      )}

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
              disabled={isSaving || !draftName.trim()}
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
