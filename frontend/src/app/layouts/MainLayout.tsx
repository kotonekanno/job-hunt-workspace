import {
  BriefcaseBusiness,
  ChevronDown,
  LogIn,
  Menu,
  Moon,
  Settings,
  Sun,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";

type Theme = "light" | "dark";

const sidebarBreakpointQuery = "(min-width: 768px)";

export type ProtectedLayoutOutletContext = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

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
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    window.matchMedia(sidebarBreakpointQuery).matches);
  const isProtectedPage = !["/login", "/register"].includes(
    location.pathname,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("job-compass-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (isProtectedPage) {
      setIsSidebarOpen(
        window.matchMedia(sidebarBreakpointQuery).matches,
      );
      return;
    }

    setIsSidebarOpen(false);
  }, [isProtectedPage]);

  useEffect(() => {
    const breakpoint = window.matchMedia(sidebarBreakpointQuery);

    function closeSidebarOnNarrowScreen(event: MediaQueryListEvent) {
      if (!event.matches) setIsSidebarOpen(false);
    }

    breakpoint.addEventListener("change", closeSidebarOnNarrowScreen);

    return () => {
      breakpoint.removeEventListener("change", closeSidebarOnNarrowScreen);
    };
  }, []);

  const protectedLayoutContext: ProtectedLayoutOutletContext = {
    isSidebarOpen,
    toggleSidebar: () => setIsSidebarOpen((isOpen) => !isOpen),
    closeSidebar: () => setIsSidebarOpen(false),
  };

  return (
    <div className="cyber-grid flex min-h-screen flex-col bg-[var(--app-bg)] text-[var(--text)] transition-colors duration-300">
      <header className="ui-system-bar fixed top-0 right-0 left-0 z-40 border-b border-[var(--line-strong)] backdrop-blur transition-colors duration-300">
        <div className="absolute bottom-0 left-0 h-px w-24 bg-[var(--accent)]" />
        <div className="flex h-16 w-full items-center">
          <div className="flex min-w-0 flex-1 items-center px-3 sm:px-4">
            {isProtectedPage && (
              <button
                type="button"
                onClick={protectedLayoutContext.toggleSidebar}
                className="ui-control mr-3 flex size-9 shrink-0 cursor-pointer items-center justify-center bg-transparent text-[var(--faint)] hover:bg-[var(--panel-raised)] hover:text-[var(--accent)]"
                aria-label={isSidebarOpen ? "メニューを閉じる" : "メニューを開く"}
                aria-expanded={isSidebarOpen}
                aria-controls="protected-sidebar"
              >                
                <Menu aria-hidden="true" className="size-4" />
              </button>
            )}

            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] ml-2"
              aria-label="極・就活管理 ホーム"
            >
              <span className="cyber-cut-sm flex size-9 shrink-0 items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_3px_12px_var(--shadow)]">
                <BriefcaseBusiness aria-hidden="true" className="size-4" />
              </span>
              <span
                className="hidden truncate px-1 text-xl font-black tracking-[0.12em] text-[var(--text-strong)] sm:block md:text-lg lg:text-xl"
                style={{ fontFamily: "tamanegi" }}
              >
                極・就活管理
              </span>
            </Link>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 px-3 sm:px-6">
            <button
              type="button"
              onClick={() => setTheme((current) =>
                current === "light" ? "dark" : "light")}
              className="ui-control flex size-9 cursor-pointer items-center justify-center border border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[0_0_14px_var(--accent-glow)]"
              aria-label={theme === "light"
                ? "ダークモードに切り替える"
                : "ライトモードに切り替える"}
              title={theme === "light" ? "ダークモード" : "ライトモード"}
            >
              {theme === "light" ? (
                <Moon aria-hidden="true" className="size-4" />
              ) : (
                <Sun aria-hidden="true" className="size-4" />
              )}
            </button>

            <details className="group relative">
              <summary className="ui-control flex cursor-pointer list-none items-center gap-2 border border-transparent p-1 pr-2 hover:border-[var(--line)] hover:bg-[var(--panel-raised)] [&::-webkit-details-marker]:hidden">
                <span className="cyber-cut-sm flex size-9 items-center justify-center bg-[var(--accent)] text-xs font-black text-[var(--accent-contrast)]">YM</span>
                <span className="hidden text-left lg:block"><span className="block text-xs font-semibold text-[var(--text-strong)]">山田みらい</span><span className="block font-mono text-[9px] tracking-wider text-[var(--muted)]">USER_01 / ONLINE</span></span>
                <ChevronDown aria-hidden="true" className="size-3.5 text-[var(--accent)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="ui-floating-surface cyber-cut absolute right-0 top-[calc(100%+0.5rem)] w-56 py-2">
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

      <main className="flex min-h-0 flex-1 pt-16">
        <Outlet context={protectedLayoutContext} />
      </main>
      <footer className="border-t border-[var(--line)] bg-[var(--panel)] transition-colors duration-300">
        <div
          className="
            mx-auto flex min-h-14 w-full max-w-[1440px] items-center
            px-5 py-3 justify-end font-mono text-[10px]
            tracking-wider text-[var(--faint)] sm:flex-row sm:px-8
          "
        >
          <p>© 2026 極・就活管理 v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
