import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

type DashboardCardProps = {
  title: string;
  label: string;
  to: string;
  linkText: string;
  children: ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  label,
  to,
  linkText,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <section
      className={`ui-panel cyber-cut border border-[var(--line)] ${className}`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3">
        <div>
          <p className="font-mono text-[8px] font-bold tracking-[0.18em] text-[var(--accent)]">
            {label}
          </p>
          <h2 className="mt-0.5 text-sm font-black text-[var(--text-strong)]">
            {title}
          </h2>
        </div>

        <Link
          to={to}
          className="ui-control flex cursor-pointer items-center gap-1 border border-[var(--line)] bg-[var(--panel-raised)] px-2.5 py-1.5 text-[9px] font-bold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {linkText}
          <ArrowUpRight className="size-3" />
        </Link>
      </header>

      <div className="p-4">
        {children}
      </div>
    </section>
  );
}
