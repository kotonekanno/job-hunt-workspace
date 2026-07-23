import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type BackLinkProps = {
  to: string;
  children: ReactNode;
};

export function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="
        inline-flex cursor-pointer items-center gap-2
        text-xs font-semibold text-[var(--muted)]
        transition-colors hover:text-[var(--accent)]
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-[var(--accent)]
      "
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
