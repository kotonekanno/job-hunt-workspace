import {
  Check,
  X,
} from "lucide-react";
import {
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  companyProfile,
} from "@/features/companies/model/companyDetail";
import type { SelectionStatus } from "@/features/companies/model/selection";
import { EditIconButton } from "@/shared/button";
import { PriorityBadge } from "../priority-badge";
import { SelectionStepBadge } from "../selection-step-badge";

export function CompanyHeader() {
  const [companyName, setCompanyName] = useState(companyProfile.name);
  const [draftName, setDraftName] = useState(companyProfile.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectionResult, setSelectionResult] = useState<SelectionStatus>(
    companyProfile.selectionResult,
  );

  function startEditingName() {
    setDraftName(companyName);
    setIsEditingName(true);
  }

  function saveCompanyName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = draftName.trim();

    if (!nextName) return;

    setCompanyName(nextName);
    setDraftName(nextName);
    setIsEditingName(false);
  }

  function cancelEditingName() {
    setDraftName(companyName);
    setIsEditingName(false);
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditingName();
    }
  }

  return (
    <header className="ui-panel cyber-cut flex flex-wrap items-center gap-4 border border-[var(--line)] p-5 sm:p-6">
      <PriorityBadge
        priority={2}
        size="m"
      />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isEditingName ? (
          <form
            onSubmit={saveCompanyName}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={handleNameKeyDown}
              aria-label="企業名を編集"
              className="min-w-0 flex-1 border-0 border-b border-[var(--accent)] bg-transparent p-0 text-xl font-black text-[var(--text-strong)] outline-none sm:text-2xl"
            />

            <button
              type="submit"
              disabled={!draftName.trim()}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="企業名を保存"
              title="保存"
            >
              <Check className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={cancelEditingName}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
              aria-label="企業名の編集をキャンセル"
              title="キャンセル"
            >
              <X className="size-3.5" />
            </button>
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

      <SelectionStepBadge
        title={companyProfile.selectionType}
        step={companyProfile.selectionStep}
        result={selectionResult}
        size="l"
        onResultChange={setSelectionResult}
      />

    </header>
  );
}
