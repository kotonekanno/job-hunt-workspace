import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import type { AuthRequest } from '@/api/generated/models';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';

type AuthMode = 'login' | 'register';

type AuthFormProps = {
  mode: AuthMode;
};

const content = {
  login: {
    label: 'ACCOUNT ACCESS',
    title: 'ログイン',
    description: '登録したメールアドレスとパスワードを入力してください。',
    submitText: 'ログインする',
    footerText: 'アカウントをお持ちでない方',
    footerLinkText: '新規登録',
    footerLink: '/register',
  },
  register: {
    label: 'CREATE ACCOUNT',
    title: '新規登録',
    description: 'メールアドレスとパスワードでアカウントを作成します。',
    submitText: 'アカウントを作成',
    footerText: 'すでにアカウントをお持ちの方',
    footerLinkText: 'ログイン',
    footerLink: '/login',
  },
} satisfies Record<AuthMode, Record<string, string>>;

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const saving = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const requestedPath = searchParams.get('returnTo');
  const returnTo =
    requestedPath?.startsWith('/') &&
    !requestedPath.startsWith('//') &&
    !requestedPath.includes('\\') &&
    !/^\/(login|register)(?:[/?#]|$)/.test(requestedPath)
      ? requestedPath
      : '/home';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const pageContent = content[mode];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving.current || auth.status === 'loading') return;
    saving.current = true;
    setIsSubmitting(true);
    setError('');
    const request: AuthRequest = { email: email.trim(), password };
    try {
      if (mode === 'login') {
        await auth.signIn(request);
        navigate(returnTo, { replace: true });
      } else {
        await auth.signUp(request);
        navigate('/login?registered=1', { replace: true });
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : '処理に失敗しました。もう一度お試しください。',
      );
    } finally {
      saving.current = false;
      setIsSubmitting(false);
    }
  };
  if (auth.status === 'authenticated')
    return <Navigate to={returnTo} replace />;

  return (
    <div className="ui-panel ui-panel-accentless mx-auto grid w-full max-w-5xl overflow-hidden border border-[var(--line-strong)] md:grid-cols-[0.82fr_1.18fr]">
      <aside className="relative hidden overflow-hidden border-r border-[var(--line)] bg-[var(--accent-soft)] p-8 md:flex md:flex-col md:justify-between lg:p-10">
        <span className="absolute top-0 left-0 h-1 w-28 bg-[var(--accent)]" />
        <div>
          <span className="cyber-cut-sm flex size-12 items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)]">
            <ShieldCheck className="size-5" />
          </span>
          <p className="mt-8 font-mono text-[9px] font-bold tracking-[0.2em] text-[var(--accent)]">
            SECURE WORKSPACE
          </p>
          <h2 className="mt-3 text-xl font-black leading-8 text-[var(--text-strong)]">
            就職活動の情報を
            <br />
            ひとつの場所に。
          </h2>
          <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
            企業、予定、タスク、ESをまとめて管理し、次にやるべきことを明確にします。
          </p>
        </div>

        <div className="mt-12 border-l-2 border-[var(--accent)] pl-4">
          <p className="text-[10px] font-bold text-[var(--text-strong)]">
            JOB HUNT MANAGEMENT
          </p>
          <p className="mt-1 font-mono text-[8px] tracking-wider text-[var(--faint)]">
            PLAN / TRACK / REVIEW
          </p>
        </div>
      </aside>

      <main className="p-6 sm:p-10 lg:p-12">
        <div className="mx-auto max-w-md">
          <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-[var(--accent)]">
            {pageContent.label}
          </p>
          <h1 className="mt-2 text-2xl font-black text-[var(--text-strong)]">
            {pageContent.title}
          </h1>
          <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
            {pageContent.description}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p role="alert" className="text-sm text-rose-500">
                {error}
              </p>
            )}
            {mode === 'login' && searchParams.get('registered') === '1' && (
              <p role="status" className="text-sm text-[var(--accent)]">
                登録が完了しました。ログインしてください。
              </p>
            )}
            {auth.status === 'loading' && (
              <p role="status" className="text-xs text-[var(--muted)]">
                認証状態を確認中…
              </p>
            )}
            <label className="block">
              <span className="text-xs font-bold text-[var(--text-strong)]">
                メールアドレス
              </span>
              <span className="relative mt-2 block">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--faint)]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="ui-field h-11 w-full border border-[var(--line)] bg-[var(--panel-raised)] pr-3 pl-10 text-sm text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-[var(--text-strong)]">
                パスワード
              </span>
              <span className="relative mt-2 block">
                <LockKeyhole className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--faint)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="パスワード"
                  className="ui-field h-11 w-full border border-[var(--line)] bg-[var(--panel-raised)] pr-11 pl-10 text-sm text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((isVisible) => !isVisible)}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center text-[var(--faint)] transition-colors hover:text-[var(--accent)]"
                  aria-label={
                    showPassword ? 'パスワードを隠す' : 'パスワードを表示する'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || auth.status === 'loading'}
              className="ui-control cyber-cut-sm flex h-11 w-full cursor-pointer items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] text-xs font-black text-[var(--accent-contrast)] shadow-[0_4px_16px_var(--accent-glow)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            >
              {isSubmitting ? '処理中…' : pageContent.submitText}
              <ArrowRight className="size-3.5" />
            </button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-2 border-t border-[var(--line)] pt-6 text-[10px]">
            <span className="text-[var(--muted)]">
              {pageContent.footerText}
            </span>
            <Link
              to={pageContent.footerLink}
              className="cursor-pointer font-black text-[var(--accent)] hover:underline"
            >
              {pageContent.footerLinkText}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
