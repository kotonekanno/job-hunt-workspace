import type { ReactElement } from "react";

type Props = {
  title: string;
  subTitle: string;
  description?: string;
  icon: ReactElement;
};

export function InnerHeader({ title, subTitle, description, icon }: Props) {
  return (
    <div className="relative mb-6 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
      <span className="absolute -bottom-px left-0 h-px w-20 bg-[var(--accent)]" />
      <div className="relative pl-4">
        <span className="absolute inset-y-0 left-0 w-px bg-[var(--line-strong)]" />
        <span className="absolute left-0 top-0 h-3 w-px bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
        <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-[var(--accent)]">
          // {subTitle}
        </p>
        <h1 className="mt-1.5 flex items-center gap-2.5 text-xl font-black tracking-[-0.015em] text-[var(--text-strong)]">
          <span className="flex size-7 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--panel-raised)] shadow-[2px_2px_0_var(--line-subtle)]">
            {icon}
          </span>
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
            {description}
          </p>
        )}
      </div>

      <div className="hidden items-end gap-1 pb-1 sm:flex" aria-hidden="true">
        <span className="h-1 w-8 bg-[var(--line)]" />
        <span className="h-1 w-3 bg-[var(--accent)] opacity-70" />
        <span className="size-1 bg-[var(--line-strong)]" />
      </div>
    </div>
  );
}
