import { Check, Clock3, Minus, X } from "lucide-react";
import {
  companyProfile,
  type SelectionResult,
} from "@/features/companies/model/companyDetail";

const statusStyle: Record<SelectionResult, string> = {
  未受験: "border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)]",
  結果待ち: "border-amber-500/50 bg-amber-500/10 text-amber-600",
  合格: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
  不合格: "border-rose-500/50 bg-rose-500/10 text-rose-500",
};

function StatusIcon({ status }: { status: SelectionResult }) {
  if (status === "合格") {
    return <Check className="size-3.5" />;
  }

  if (status === "不合格") {
    return <X className="size-3.5" />;
  }

  if (status === "結果待ち") {
    return <Clock3 className="size-3.5" />;
  }

  return <Minus className="size-3.5" />;
}

export function CompanyHeader() {
  const status = companyProfile.status as SelectionResult;

  return (
    <header className="cyber-cut flex flex-wrap items-center gap-4 border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_6px_24px_var(--shadow)] sm:p-6">
      <span className="border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--accent)]">
        {companyProfile.interest}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate text-xl font-black text-[var(--text-strong)] sm:text-2xl">
          {companyProfile.name}
        </h1>
      </div>

      <div className="cyber-cut-sm flex items-stretch border border-[var(--line-strong)] bg-[var(--panel-raised)] shadow-[0_3px_12px_var(--shadow)]">
        <div className="min-w-32 px-4 py-2.5">
          <p className="font-mono text-[8px] tracking-[0.14em] text-[var(--faint)]">
            {companyProfile.selectionType}
          </p>
          <p className="mt-1 text-sm font-black text-[var(--text-strong)]">
            {companyProfile.selectionStep}
          </p>
        </div>

        <div className={`flex min-w-24 flex-col items-center justify-center gap-1 border-l px-4 py-2 ${statusStyle[status]}`}>
          <StatusIcon status={status} />
          <span className="text-[10px] font-bold">
            {status}
          </span>
        </div>
      </div>
    </header>
  );
}
