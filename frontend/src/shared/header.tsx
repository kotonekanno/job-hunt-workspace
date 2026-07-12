import type { ReactElement } from "react";

type Props = {
  title: string;
  subTitle: string;
  description?: string;
  icon: ReactElement;
}

export function InnerHeader({ title, subTitle, description, icon }: Props) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-[var(--accent)]">
          // {subTitle}
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-black text-[var(--text-strong)]">
          {icon}
          {title}
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}