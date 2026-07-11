import { BriefcaseBusiness, ChevronDown, LogIn, Moon, Settings, Sun, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

type Theme = "light" | "dark";

const accountMenuItems = [
  { label: "アカウント設定", to: "/settings", icon: Settings },
  { label: "ログイン", to: "/login", icon: LogIn },
  { label: "新規登録", to: "/register", icon: UserPlus },
];

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("job-compass-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function MainLayout() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("job-compass-theme", theme);
  }, [theme]);

  return (
    <div className="cyber-grid flex min-h-screen flex-col bg-[var(--app-bg)] text-[var(--text)] transition-colors duration-300">
      <header className="relative z-40 border-b border-[var(--line-strong)] bg-[var(--panel)]/95 shadow-[0_2px_18px_var(--shadow)] backdrop-blur transition-colors duration-300">
        <div className="absolute bottom-0 left-0 h-px w-1/3 bg-[var(--accent)]" />
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" aria-label="超・就活管理 ホーム">
            <span className="cyber-cut-sm flex size-9 items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_3px_12px_var(--shadow)]">
              <BriefcaseBusiness aria-hidden="true" className="size-4" />
            </span>
            <span>
              <span className="block text-base font-black tracking-[0.14em] text-[var(--text-strong)]">超・就活管理</span>
              <span className="hidden font-mono text-[9px] tracking-[0.22em] text-[var(--accent)] sm:block">CAREER_OS // MANAGEMENT</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} className="flex size-9 items-center justify-center border border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]" aria-label={theme === "light" ? "ダークモードに切り替える" : "ライトモードに切り替える"} title={theme === "light" ? "ダークモード" : "ライトモード"}>
              {theme === "light" ? <Moon aria-hidden="true" className="size-4" /> : <Sun aria-hidden="true" className="size-4" />}
            </button>

            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 border border-transparent p-1 pr-2 transition-colors hover:border-[var(--line)] hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] [&::-webkit-details-marker]:hidden">
                <span className="cyber-cut-sm flex size-9 items-center justify-center bg-[var(--accent)] text-xs font-black text-[var(--accent-contrast)]">YM</span>
                <span className="hidden text-left sm:block"><span className="block text-xs font-semibold text-[var(--text-strong)]">山田みらい</span><span className="block font-mono text-[9px] tracking-wider text-[var(--muted)]">USER_01 / ONLINE</span></span>
                <ChevronDown aria-hidden="true" className="size-3.5 text-[var(--accent)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="cyber-cut absolute right-0 top-[calc(100%+0.5rem)] w-56 border border-[var(--line-strong)] bg-[var(--panel)] py-2 shadow-[0_12px_32px_var(--shadow)]">
                <p className="border-b border-[var(--line)] px-4 pb-2 font-mono text-[9px] font-semibold tracking-[0.2em] text-[var(--accent)]">// ACCOUNT_ACCESS</p>
                <nav className="pt-2" aria-label="アカウントメニュー">
                  {accountMenuItems.map(({ label, to, icon: Icon }) => (
                    <Link key={to} to={to} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")} className="flex items-center gap-3 border-l-2 border-transparent px-4 py-2.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]"><Icon aria-hidden="true" className="size-4" />{label}</Link>
                  ))}
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1"><Outlet /></main>
      <footer className="border-t border-[var(--line)] bg-[var(--panel)] transition-colors duration-300">
        <div className="mx-auto flex min-h-14 w-full max-w-[1440px] flex-col items-center justify-between gap-1 px-5 py-3 font-mono text-[10px] tracking-wider text-[var(--faint)] sm:flex-row sm:px-8">
          <p>就活管理アプリ 超・就活管理</p><p>© 2026 超・就活管理</p>
        </div>
      </footer>
    </div>
  );
}
