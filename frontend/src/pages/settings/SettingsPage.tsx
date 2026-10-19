import { PageLoading, PageLoadError } from '@/shared/LoadingState';
import { InnerHeader } from '@/shared/header';
import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/api/generated/api';
import type { GetCurrentUser200 } from '@/api/generated/models/getCurrentUser200';
import { getAccessToken } from '@/features/auth/model/accessToken';
import { toast } from '@/shared/toast';

export function SettingsPage() {
  const [user, setUser] = useState<GetCurrentUser200 | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const token = getAccessToken();
    void getCurrentUser({
      signal: controller.signal,
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        if (response.status !== 200) throw new Error('Failed to load account');
        setUser(response.data);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoadFailed(true);
        toast.error(
          'アカウント情報を取得できませんでした。画面を再読み込みしてください。',
        );
      });

    return () => controller.abort();
  }, []);

  if (loadFailed) return <PageLoadError />;
  if (!user) return <PageLoading />;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <InnerHeader
        title="アカウント設定"
        subTitle="ACCOUNT_CONFIG"
        description="ログイン情報を確認します。"
        icon={<UserRound className="size-5 text-[var(--accent)]" />}
      />

      <section className="ui-panel ui-panel-accentless cyber-cut relative mt-8 border border-[var(--line)] p-6 transition-colors duration-300 sm:p-8">
        <span className="absolute top-0 left-8 h-0.5 w-20 bg-[var(--accent)]" />
        <h2 className="text-sm font-bold text-[var(--accent)]">ログイン情報</h2>
        <dl className="mt-6 divide-y divide-[var(--line)] text-sm">
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
            <dt className="font-mono text-[var(--faint)]">EMAIL</dt>
            <dd className="font-medium text-[var(--text-strong)]">
              {user?.email ??
                (loadFailed ? '取得できませんでした' : '読み込み中…')}
            </dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
            <dt className="font-mono text-[var(--faint)]">PASSWORD</dt>
            <dd className="font-medium text-[var(--text-strong)]">••••••••</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
