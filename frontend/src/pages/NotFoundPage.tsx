import { ArrowLeft, LogIn, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] w-full items-center justify-center px-5 py-10 sm:px-8">
      <section
        className="ui-panel w-full max-w-2xl border border-[var(--line-strong)] p-8 text-center sm:p-12"
        aria-labelledby="not-found-title"
      >
        <SearchX
          aria-hidden="true"
          className="mx-auto size-8 text-[var(--accent)]"
        />
        <p className="mt-5 font-mono text-7xl font-black tracking-tight text-[var(--accent)] sm:text-8xl">
          404
        </p>
        <p className="mt-2 font-mono text-[10px] font-bold tracking-[0.2em] text-[var(--muted)]">
          PAGE NOT FOUND
        </p>
        <h1
          id="not-found-title"
          className="mt-6 text-xl font-black text-[var(--text-strong)] sm:text-2xl"
        >
          ページが見つかりません
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          アクセスしたURLが間違っているか、ページが移動・削除された可能性があります。URLをご確認いただくか、トップページからお進みください。
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="ui-control cyber-cut-sm inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-contrast)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            トップページへ戻る
          </Link>
          <Link
            to="/login"
            className="ui-control inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel-raised)] px-5 py-3 text-sm font-bold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <LogIn aria-hidden="true" className="size-4" />
            ログイン
          </Link>
        </div>
      </section>
    </div>
  );
}
