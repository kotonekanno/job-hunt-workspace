import {
  companyProfile,
  type SelectionResult,
} from "@/features/companies/model/companyDetail";
import { EditIconButton } from "@/shared/button";
import { PriorityBadge } from "../priority-badge";
import { SelectionStepBadgeForHeader } from "../selection-step-badge";

export function CompanyHeader() {
  return (
    <header className="cyber-cut flex flex-wrap items-center gap-4 border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_6px_24px_var(--shadow)] sm:p-6">
      <PriorityBadge
        priority={2}
        size="m"
      />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate text-xl font-black text-[var(--text-strong)] sm:text-2xl">
          {companyProfile.name}
        </h1>
        <EditIconButton
          onClick={() => {}}
        />
      </div>

      <SelectionStepBadgeForHeader
        title="本選考"
        step="最終面接"
        result="failed"
      />

    </header>
  );
}
