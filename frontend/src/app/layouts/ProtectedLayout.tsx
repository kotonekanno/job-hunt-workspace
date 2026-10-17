import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  FilePenLine,
  Home,
  NotebookTabs,
} from 'lucide-react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import type { ProtectedLayoutOutletContext } from '@/app/layouts/MainLayout';
import { cn } from '@/lib/utils';

const navigationItems = [
  { label: 'ホーム', to: '/home', icon: Home, end: true },
  { label: '企業管理', to: '/companies', icon: Building2 },
  { label: 'カレンダー', to: '/calendar', icon: CalendarDays },
  { label: 'タスク', to: '/tasks', icon: ClipboardCheck },
  { label: 'ES・作文', to: '/essays', icon: FilePenLine },
  { label: 'ドキュメント', to: '/documents', icon: NotebookTabs },
];

export function ProtectedLayout() {
  const { isSidebarOpen, closeSidebar } =
    useOutletContext<ProtectedLayoutOutletContext>();

  return (
    <div className="relative min-h-full w-full">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed top-16 right-0 bottom-0 left-0 z-20 cursor-pointer bg-[var(--overlay)] backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
          aria-label="メニューを閉じる"
        />
      )}

      <aside
        id="protected-sidebar"
        className={cn(
          'ui-sidebar fixed top-16 bottom-0 left-0 z-30 flex w-64 -translate-x-full flex-col border-r border-[var(--line)] px-4 py-5 shadow-[8px_0_30px_var(--shadow)] backdrop-blur transition-transform duration-300 md:w-60 md:shadow-none lg:w-64',
          isSidebarOpen && 'translate-x-0',
        )}
      >
        <div className="relative mb-5 border-b border-[var(--line)] px-3 pb-5">
          <span className="absolute -bottom-px left-3 h-px w-16 bg-[var(--accent)]" />
          <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-[var(--accent)]">
            // YOUR_WORKSPACE
          </p>
          <p className="mt-2 text-sm font-bold tracking-wide text-[var(--text-strong)]">
            就活管理ボード
          </p>
        </div>

        <nav
          className="min-h-0 flex-1 overflow-y-auto"
          aria-label="メインメニュー"
        >
          <ul className="space-y-1">
            {navigationItems.map(({ label, to, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      'ui-control cyber-cut-sm flex cursor-pointer items-center gap-3 border-l-2 border-transparent px-3 py-3 text-sm font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]',
                      isActive &&
                        'border-[var(--accent)] bg-[var(--accent-soft)] font-bold text-[var(--text-strong)] shadow-[0_3px_14px_var(--shadow)]',
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-[18px]" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section
        className={cn(
          'min-w-0 p-4 transition-[margin] duration-300 sm:p-6 md:p-8 lg:p-10',
          isSidebarOpen && 'md:ml-60 lg:ml-64',
        )}
      >
        <Outlet />
      </section>
    </div>
  );
}
