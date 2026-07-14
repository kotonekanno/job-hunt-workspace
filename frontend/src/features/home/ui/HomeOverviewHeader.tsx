import {
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

type OverviewItem = {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  to: string;
};

type HomeOverviewHeaderProps = {
  date: string;
  items: OverviewItem[];
};

const weekdayLabels = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];

export function HomeOverviewHeader({
  date,
  items,
}: HomeOverviewHeaderProps) {
  const currentDate = new Date(`${date}T00:00:00`);
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const weekday = weekdayLabels[currentDate.getDay()];

  return (
    <header className="cyber-cut overflow-hidden border border-[var(--line-strong)] bg-[var(--panel)] shadow-[0_8px_28px_var(--shadow)]">
      <div className="flex flex-col lg:flex-row">
        <div className="relative flex min-w-56 items-center gap-4 border-b border-[var(--line)] px-5 py-5 lg:border-r lg:border-b-0 sm:px-6">
          <span className="absolute top-0 left-0 h-1 w-24 bg-[var(--accent)]" />

          <div>
            <p className="font-mono text-[8px] font-bold tracking-[0.2em] text-[var(--accent)]">
              TODAY
            </p>
            <p className="mt-1 font-mono text-2xl font-black tracking-tight text-[var(--text-strong)]">
              {month}.{day}
            </p>
          </div>

          <div className="border-l border-[var(--line)] pl-4">
            <p className="font-mono text-xs font-black text-[var(--accent)]">
              {weekday}
            </p>
            <p className="mt-1 font-mono text-[9px] text-[var(--faint)]">
              {currentDate.getFullYear()}
            </p>
          </div>
        </div>

        <nav
          className="grid min-w-0 flex-1 grid-cols-2 xl:grid-cols-4"
          aria-label="各機能の概要"
        >
          {items.map(({ label, value, unit, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className="group flex min-w-0 cursor-pointer items-center gap-3 border-r border-b border-[var(--line)] px-4 py-4 transition-colors hover:bg-[var(--panel-raised)] xl:border-b-0 last:border-r-0"
            >
              <span className="flex size-8 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon className="size-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[8px] font-semibold text-[var(--faint)]">
                  {label}
                </p>
                <p className="mt-0.5 text-lg font-black text-[var(--text-strong)]">
                  {value}
                  <span className="ml-1 text-[9px] font-semibold text-[var(--muted)]">
                    {unit}
                  </span>
                </p>
              </div>

              <ArrowUpRight className="size-3.5 shrink-0 text-[var(--faint)] transition-colors group-hover:text-[var(--accent)]" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
