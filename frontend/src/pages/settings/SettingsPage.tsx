export function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[var(--accent)]">// ACCOUNT_CONFIG</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">アカウント設定</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">プロフィールやログイン情報を管理します。</p>
      <section className="cyber-cut relative mt-8 border border-[var(--line)] bg-[var(--panel)]/90 p-6 shadow-[0_8px_30px_var(--shadow)] transition-colors duration-300 sm:p-8">
        <span className="absolute top-0 left-8 h-0.5 w-20 bg-[var(--accent)]" />
        <h2 className="text-sm font-bold text-[var(--accent)]">プロフィール</h2>
        <dl className="mt-6 divide-y divide-[var(--line)] text-sm">
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]"><dt className="font-mono text-[var(--faint)]">NAME</dt><dd className="font-medium text-[var(--text-strong)]">山田みらい</dd></div>
          <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]"><dt className="font-mono text-[var(--faint)]">EMAIL</dt><dd className="font-medium text-[var(--text-strong)]">mirai@example.com</dd></div>
        </dl>
      </section>
    </div>
  );
}
