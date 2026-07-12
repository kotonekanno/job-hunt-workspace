import {
  Building2,
  CalendarDays,
  ChevronUp,
  ClipboardCheck,
  FilePenLine,
  Home,
  Menu,
  Settings,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "ホーム", to: "/", icon: Home, end: true },
  { label: "企業管理", to: "/companies", icon: Building2 },
  { label: "カレンダー", to: "/calendar", icon: CalendarDays },
  { label: "タスク", to: "/tasks", icon: ClipboardCheck },
  { label: "ES・作文", to: "/essays", icon: FilePenLine },
];

const settingItems = [
  {
    label: "アカウント設定",
    description: "プロフィール・ログイン情報",
    to: "/settings",
    icon: UserRound,
    end: true,
  },
  {
    label: "アプリ内設定",
    description: "表示・通知・動作設定",
    to: "/settings/app",
    icon: SlidersHorizontal,
    end: false,
  },
];

export function ProtectedLayout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    location.pathname.startsWith("/settings"),
  );

  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <div className="relative min-h-full w-full">
      <button
        type="button"
        className="cyber-cut-sm fixed right-5 bottom-5 z-30 flex size-12 cursor-pointer items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xl md:hidden"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      {isMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-pointer bg-[var(--overlay)] backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
          aria-label="メニューを閉じる"
        />
      )}

      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-20 flex w-64 -translate-x-full flex-col border-r border-[var(--line)] bg-[var(--panel)]/95 px-4 py-6 shadow-[8px_0_30px_var(--shadow)] backdrop-blur transition-transform duration-300 md:w-60 md:translate-x-0 lg:w-64",
          isMenuOpen && "translate-x-0",
        )}
      >
        <div className="relative mb-7 border-b border-[var(--line)] px-3 pb-6">
          <span className="absolute -bottom-px left-3 h-px w-16 bg-[var(--accent)]" />
          <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-[var(--accent)]">
            // YOUR_WORKSPACE
          </p>
          <p className="mt-2 text-sm font-bold tracking-wide text-[var(--text-strong)]">
            就活管理ボード
          </p>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="メインメニュー">
          <ul className="space-y-1">
            {navigationItems.map(({ label, to, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) => cn(
                    "cyber-cut-sm flex cursor-pointer items-center gap-3 border-l-2 border-transparent px-3 py-3 text-sm font-medium text-[var(--muted)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]",
                    isActive
                      && "border-[var(--accent)] bg-[var(--accent-soft)] font-bold text-[var(--text-strong)] shadow-[0_3px_14px_var(--shadow)]",
                  )}
                >
                  <Icon aria-hidden="true" className="size-[18px]" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative mt-4 border-t border-[var(--line)] pt-4">
          {isSettingsOpen && (
            <div className="absolute right-0 bottom-[calc(100%+0.5rem)] left-0 border border-[var(--line-strong)] bg-[var(--panel-raised)] p-1.5 shadow-[0_10px_28px_var(--shadow)]">
              <p className="px-2 py-1.5 font-mono text-[8px] font-bold tracking-[0.16em] text-[var(--faint)]">
                SETTINGS
              </p>

              {settingItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) => cn(
                    "flex cursor-pointer items-center gap-2.5 border-l-2 border-transparent px-2.5 py-2.5 text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]",
                    isActive
                      && "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-strong)]",
                  )}
                >
                  <item.icon className="size-4 shrink-0 text-[var(--accent)]" />
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[8px] text-[var(--faint)]">
                      {item.description}
                    </span>
                  </span>
                </NavLink>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
            className={cn(
              "cyber-cut-sm flex w-full cursor-pointer items-center gap-3 border border-[var(--line)] px-3 py-3 text-sm font-bold text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]",
              location.pathname.startsWith("/settings")
                && "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-strong)]",
            )}
            aria-expanded={isSettingsOpen}
          >
            <Settings className="size-[18px] text-[var(--accent)]" />
            <span className="flex-1 text-left">設定</span>
            <ChevronUp
              className={cn(
                "size-3.5 transition-transform",
                !isSettingsOpen && "rotate-180",
              )}
            />
          </button>
        </div>
      </aside>

      <section className="min-w-0 p-5 sm:p-8 md:ml-60 lg:ml-64 lg:p-10">
        <Outlet />
      </section>
    </div>
  );
}
