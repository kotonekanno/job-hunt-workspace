import { useEffect, useState } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom';
import type { ProtectedLayoutOutletContext } from '@/app/layouts/MainLayout';
import { ensureAuthenticated } from '@/features/auth/model/authenticate';
import { toast } from '@/shared/toast';

export function RequireAuth() {
  const { key } = useLocation();
  const [result, setResult] = useState<{
    key: string;
    authenticated: boolean;
  } | null>(null);
  const context = useOutletContext<ProtectedLayoutOutletContext>();

  useEffect(() => {
    let active = true;
    void ensureAuthenticated().then((authenticated) => {
      if (!active) return;
      if (!authenticated)
        toast.error('ログインしてください。', 'login-required');
      setResult({ key, authenticated });
    });
    return () => {
      active = false;
    };
  }, [key]);

  if (result?.key !== key) return null;

  return result.authenticated ? (
    <Outlet context={context} />
  ) : (
    <Navigate to="/login" replace />
  );
}
