import type {
  CompanyPriority,
  CompanyProgress,
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

export const progressStyle: Record<CompanyProgress, string> = {
  未応募: "border-[var(--line)] text-[var(--faint)]",
  選考中: "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]",
  結果待ち: "border-amber-500/50 bg-amber-500/10 text-amber-600",
  内定: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
  終了: "border-rose-500/50 bg-rose-500/10 text-rose-500",
};
