import type {
  CompanyPriority,
} from "@/features/companies/model/companyList";

export const priorityStyle: Record<CompanyPriority, string> = {
  1: "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]",
  2: "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]",
  3: "border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--text-strong)]",
  4: "border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)]",
  5: "border-[var(--line)] bg-transparent text-[var(--faint)]",
  0: "border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--text-strong)]",
  6: "border-[var(--line)] bg-transparent text-[var(--faint)] opacity-75",
};

export const priorityLabels: Record<CompanyPriority, string> = {
  1: "第1志望",
  2: "第2志望",
  3: "第3志望",
  4: "第4志望",
  5: "第5志望",
  0: "未分類",
  6: "アーカイブ",
};
