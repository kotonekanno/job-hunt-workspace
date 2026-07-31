import { Files } from "lucide-react";
import { BackLink } from "@/shared/BackLink";

type EssayGroupHeaderProps = {
  name: string;
  essayCount: number;
};

export function EssayGroupHeader({
  name,
  essayCount,
}: EssayGroupHeaderProps) {
  return (
    <div className="mb-5">
      <div className="ui-panel flex items-center gap-4 border border-[var(--line)] px-5 py-4">
        <div className="flex size-11 shrink-0 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--accent)]">
          <Files className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[var(--muted)]">
            QUESTION GENRE
          </p>
          <h1 className="mt-1 truncate text-xl font-black text-[var(--text-strong)]">
            {name}
          </h1>
        </div>

        <div className="shrink-0 border-l border-[var(--line)] pl-5 text-right">
          <p className="font-mono text-2xl font-black text-[var(--text-strong)]">
            {essayCount}
          </p>
          <p className="text-[9px] font-bold text-[var(--muted)]">ES</p>
        </div>
      </div>

      <div className="mt-4">
        <BackLink to="/essays">ES文章ストックへ戻る</BackLink>
      </div>
    </div>
  );
}
