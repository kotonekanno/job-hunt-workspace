import { LogOut, Settings, UserRound } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '@/api/generated/api';
import { clearAccessToken, useAccessToken } from '../model/accessToken';
import { toast } from '@/shared/toast';

export function AccountMenu() {
  const token = useAccessToken();
  const navigate = useNavigate();
  const menu = useRef<HTMLDetailsElement>(null);
  const pending = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (pending.current) return;
    pending.current = true;
    setIsLoggingOut(true);
    try {
      const response = await logout({
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status !== 204) {
        toast.error('ログアウトできませんでした。もう一度お試しください。');
        return;
      }
      clearAccessToken();
      navigate('/login', { replace: true });
    } catch {
      toast.error('ログアウトできませんでした。もう一度お試しください。');
    } finally {
      pending.current = false;
      setIsLoggingOut(false);
    }
  }

  if (!token) return null;

  const itemClassName =
    'flex w-full cursor-pointer items-center gap-3 border-l-2 border-transparent px-4 py-2.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]';

  return (
    <details ref={menu} className="group relative">
      <summary
        aria-label="アカウントメニュー"
        className="ui-control cyber-cut-sm flex size-9 cursor-pointer list-none items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] [&::-webkit-details-marker]:hidden"
      >
        <UserRound aria-hidden="true" className="size-4" />
      </summary>
      <div className="ui-floating-surface cyber-cut absolute right-0 top-[calc(100%+0.5rem)] w-56 py-2">
        <p className="border-b border-[var(--line)] px-4 pb-2 font-mono text-[9px] font-semibold tracking-[0.2em] text-[var(--accent)]">
          // ACCOUNT_ACCESS
        </p>
        <nav className="pt-2" aria-label="アカウントメニュー">
          <Link
            to="/settings"
            onClick={() => menu.current?.removeAttribute('open')}
            className={itemClassName}
          >
            <Settings aria-hidden="true" className="size-4" />
            アカウント設定
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className={`${itemClassName} disabled:cursor-wait disabled:opacity-50`}
          >
            <LogOut aria-hidden="true" className="size-4" />
            ログアウト
          </button>
        </nav>
      </div>
    </details>
  );
}
