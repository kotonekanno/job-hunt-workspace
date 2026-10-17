import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '@/api/generated/api';
import type { AuthRequest } from '@/api/generated/models/authRequest';
import { setAccessToken } from '@/features/auth/model/accessToken';
import { toast } from '@/shared/toast';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const pageContent = content[mode];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    const request: AuthRequest = { email, password };

    try {
      if (mode === 'register') {
        const response = await register(request, { credentials: 'include' });
        if (response.status === 201) {
          setPassword('');
          toast.success('アカウントを作成しました。ログインしてください。');
          navigate('/login', { replace: true });
        } else {
          toast.error(
            response.status === 409
              ? 'このメールアドレスはすでに登録されています。'
              : response.status === 400
                ? '入力内容を確認してください。'
                : 'アカウントの作成に失敗しました。時間をおいて再度お試しください。',
          );
        }
      } else {
        const response = await login(request, { credentials: 'include' });
        if (response.status === 200) {
          if (
            typeof response.data.accessToken !== 'string' ||
            !response.data.accessToken.trim()
          ) {
            toast.error(
              'ログイン情報を取得できませんでした。再度お試しください。',
            );
            return;
          }
          setAccessToken(response.data.accessToken);
          setPassword('');
          navigate('/home', { replace: true });
        } else {
          toast.error(
            response.status === 401 || response.status === 404
              ? 'メールアドレスまたはパスワードが正しくありません。'
              : response.status === 403
                ? 'アカウントが未認証です。'
                : response.status === 400
                  ? '入力内容を確認してください。'
                  : 'ログインに失敗しました。時間をおいて再度お試しください。',
          );
        }
      }
    } catch {
      toast.error(
        '処理に失敗しました。通信環境を確認して、再度お試しください。',
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ui-panel ui-panel-accentless mx-auto grid w-full max-w-5xl overflow-hidden border border-[var(--line-strong)] md:grid-cols-[0.82fr_1.18fr]">
      <aside className="relative hidden overflow-hidden border-r border-[var(--line)] bg-[var(--accent-soft)] p-8 md:flex md:flex-col md:justify-between lg:p-10">
        <span className="absolute top-0 left-0 h-1 w-28 bg-[var(--accent)]" />
        <div>
          <span className="cyber-cut-sm flex size-12 items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)]">
            <ShieldCheck className="size-5" />
          </span>
          <p className="mt-8 font-mono text-[9px] font-bold tracking-[0.2em] text-[var(--accent)]">
            JOB HUNT WORKSPACE
          </p>
          <h2 className="mt-3 text-xl font-black leading-8 text-[var(--text-strong)]">
            極・就活管理
          </h2>
          <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
            企業、予定、タスク、ESをまとめて管理します。
          </p>
        </div>

        <div className="mt-12 border-l-2 border-[var(--accent)] pl-4">
          <p className="text-[10px] font-bold text-[var(--text-strong)]">
            JOB HUNT WORKSPACE
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
              <span className="mt-1.5 block text-[9px] text-[var(--faint)]">
                パスワードを入力してください
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="ui-control cyber-cut-sm flex h-11 w-full cursor-pointer items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] text-xs font-black text-[var(--accent-contrast)] shadow-[0_4px_16px_var(--accent-glow)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            >
              {isSubmitting ? '送信中…' : pageContent.submitText}
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
