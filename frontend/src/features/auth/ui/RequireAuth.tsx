import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'loading')
    return (
      <p role="status" className="p-6 text-sm text-[var(--muted)]">
        認証状態を確認中…
      </p>
    );
  if (auth.status === 'error')
    return (
      <div className="p-6">
        <p role="alert" className="text-sm text-rose-500">
          {auth.error}
        </p>
        <button
          type="button"
          onClick={() => {
            void auth.retrySession();
          }}
          className="mt-3 cursor-pointer border border-[var(--accent)] px-4 py-2 text-sm text-[var(--accent)]"
        >
          再試行
        </button>
      </div>
    );
  if (auth.status !== 'authenticated')
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search + location.hash)}`}
        replace
      />
    );
  return children;
}
