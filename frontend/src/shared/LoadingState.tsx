import { LoaderCircle } from 'lucide-react';

export function LoadingIndicator({
  label = '読み込み中…',
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2.5 text-xs font-bold text-[var(--accent)]"
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-4 animate-spin motion-reduce:animate-none"
      />
      <span>{label}</span>
    </div>
  );
}

export function PageLoading({
  label = '画面を読み込んでいます',
}: {
  label?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl py-8" aria-busy="true">
      <div className="ui-panel border border-[var(--line)] p-6 sm:p-8">
        <LoadingIndicator label={label} />
        <div
          aria-hidden="true"
          className="mt-8 space-y-5 animate-pulse motion-reduce:animate-none"
        >
          <div className="h-4 w-32 bg-[var(--accent-soft)]" />
          <div className="h-7 w-2/3 max-w-sm bg-[var(--line-subtle)]" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-28 border border-[var(--line)] bg-[var(--panel-raised)] p-4"
              >
                <div className="h-3 w-1/2 bg-[var(--accent-soft)]" />
                <div className="mt-5 h-3 w-full bg-[var(--line-subtle)]" />
                <div className="mt-3 h-3 w-2/3 bg-[var(--line-subtle)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageLoadError() {
  return (
    <div
      role="alert"
      className="ui-panel mx-auto w-full max-w-7xl border border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]"
    >
      情報を取得できませんでした。画面を再読み込みしてください。
    </div>
  );
}
