import { Building2, CalendarDays, ClipboardCheck, FilePenLine, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "ダッシュボード", to: "/", icon: LayoutDashboard, end: true },
  { label: "企業管理", to: "/companies", icon: Building2 },
  { label: "カレンダー", to: "/calendar", icon: CalendarDays },
  { label: "タスク", to: "/tasks", icon: ClipboardCheck },
  { label: "ES・作文", to: "/essays", icon: FilePenLine },
];

export function ProtectedLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="relative flex min-h-full w-full">
      <button type="button" className="cyber-cut-sm fixed right-5 bottom-5 z-30 flex size-12 items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_6px_20px_var(--shadow)] md:hidden" onClick={() => setIsMenuOpen((isOpen) => !isOpen)} aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"} aria-expanded={isMenuOpen}>
        {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {isMenuOpen && <button type="button" className="fixed inset-0 z-10 bg-[var(--overlay)] backdrop-blur-sm md:hidden" onClick={() => setIsMenuOpen(false)} aria-label="メニューを閉じる" />}

      <aside className={cn("fixed inset-y-0 left-0 z-20 flex w-64 -translate-x-full flex-col border-r border-[var(--line)] bg-[var(--panel)]/95 px-4 py-6 shadow-[8px_0_30px_var(--shadow)] transition-all duration-300 md:static md:w-60 md:translate-x-0 lg:w-64", isMenuOpen && "translate-x-0")}>
        <div className="relative mb-7 border-b border-[var(--line)] px-3 pb-6">
          <span className="absolute -bottom-px left-3 h-px w-16 bg-[var(--accent)]" />
          <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-[var(--accent)]">// YOUR_WORKSPACE</p>
          <p className="mt-2 text-sm font-bold tracking-wide text-[var(--text-strong)]">就活管理ボード</p>
        </div>
        <nav className="flex-1" aria-label="メインメニュー">
          <ul className="space-y-1">
            {navigationItems.map(({ label, to, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => cn("cyber-cut-sm flex items-center gap-3 border-l-2 border-transparent px-3 py-3 text-sm font-medium text-[var(--muted)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]", isActive && "border-[var(--accent)] bg-[var(--accent-soft)] font-bold text-[var(--text-strong)] shadow-[0_3px_14px_var(--shadow)]")}>
                  <Icon aria-hidden="true" className="size-[18px]" /><span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><Outlet /></section>
    </div>
  );
}
