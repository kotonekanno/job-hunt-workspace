import {
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type WidgetFrameProps = {
  title: string;
  code: string;
  icon: LucideIcon;
  children: ReactNode;
  onRemove?: () => void;
  action?: ReactNode;
  headingAccessory?: ReactNode;
  className?: string;
};

export function WidgetFrame(props: WidgetFrameProps) {
  const Icon = props.icon;

  return (
    <section className={`cyber-cut border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_6px_22px_var(--shadow)] ${props.className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center bg-[var(--accent-soft)]">
            <Icon
              aria-hidden="true"
              className="size-4 text-[var(--accent)]"
            />
          </span>

          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">
              // {props.code}
            </p>

            <h2 className="mt-1 text-sm font-bold text-[var(--text-strong)]">
              {props.title}
            </h2>
          </div>

          {props.headingAccessory}
        </div>

        <div className="flex items-center gap-2">
          {props.action}
          {props.onRemove && (
            <button
              type="button"
              onClick={props.onRemove}
              className="flex size-7 items-center justify-center text-[var(--faint)] transition-colors hover:text-rose-500"
              aria-label={`${props.title}を削除する`}
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {props.children}
      </div>
    </section>
  );
}
