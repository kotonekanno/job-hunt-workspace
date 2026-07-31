import {
  ArrowUpRight,
  FilePenLine,
  NotebookTabs,
} from "lucide-react";
import { Link } from "react-router-dom";

const resourceLinks = [
  {
    title: "ES文章ストック",
    label: "ESSAY ARCHIVE",
    description: "設問と回答を、質問のジャンルごとに整理する",
    action: "文章ストックを開く",
    to: "/essays",
    icon: FilePenLine,
  },
  {
    title: "ドキュメント",
    label: "DOCUMENTS",
    description: "就活プランや面接対策を、自由なメモにまとめる",
    action: "ドキュメントを開く",
    to: "/documents",
    icon: NotebookTabs,
  },
];

export function HomeResourceLinks() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {resourceLinks.map((item, index) => (
        <Link
          key={item.to}
          to={item.to}
          className="group cyber-cut relative flex min-h-52 cursor-pointer flex-col overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-[0_5px_18px_var(--shadow)] transition-[border-color,box-shadow] hover:border-[var(--accent)] hover:shadow-[0_8px_24px_var(--shadow)]"
        >
          <span className="absolute inset-y-0 left-0 w-1 bg-[var(--accent)] opacity-30 transition-opacity group-hover:opacity-100" />

          <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
            <p className="font-mono text-[8px] font-bold tracking-[0.16em] text-[var(--accent)]">
              {item.label}
            </p>
            <span className="flex items-center gap-1.5 font-mono text-[7px] tracking-[0.12em] text-[var(--faint)]">
              RESOURCE
              <span className="size-1 bg-[var(--accent)]" />
            </span>
          </header>

          <div className="relative flex flex-1 flex-col px-4 py-5">
            <span className="pointer-events-none absolute right-4 top-5 font-mono text-5xl font-black leading-none text-[var(--line)] transition-colors group-hover:text-[var(--accent-soft)]">
              0{index + 1}
            </span>

            <span className="relative flex size-12 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--accent)] shadow-[3px_3px_0_var(--line)] transition-[border-color,background-color,box-shadow] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-soft)] group-hover:shadow-[3px_3px_0_var(--accent)]">
              <item.icon className="size-5" />
            </span>

            <h2 className="relative mt-5 text-sm font-black text-[var(--text-strong)]">
              {item.title}
            </h2>
            <p className="relative mt-2 max-w-56 text-[10px] leading-5 text-[var(--muted)]">
              {item.description}
            </p>
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--panel-raised)]/50 px-4 py-3 text-[9px] font-bold text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
            <span>{item.action}</span>
            <ArrowUpRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </footer>
        </Link>
      ))}
    </div>
  );
}
