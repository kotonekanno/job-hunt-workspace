import { ChevronDown, Trash2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type WidgetFrameProps = {
  title: string;
  code: string;
  icon: LucideIcon;
  children: ReactNode;
  onRemove?: () => void;
  action?: ReactNode;
  headingAccessory?: ReactNode;
  className?: string;
  contentClassName?: string;
  expanded?: boolean;
  onToggle?: () => void;
  contentId?: string;
};

export function WidgetFrame(props: WidgetFrameProps) {
  const Icon = props.icon;

  return (
    <section
      className={`ui-panel cyber-cut min-w-0 border border-[var(--line)] p-5 ${props.className ?? ''}`}
    >
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
        {props.onToggle && (
          <button
            type="button"
            onClick={props.onToggle}
            aria-label={`${props.title}の表示を切り替え`}
            aria-expanded={props.expanded}
            aria-controls={props.contentId}
            className="absolute inset-0 cursor-pointer transition-colors hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          />
        )}
        <div
          className={`flex min-w-0 flex-1 flex-wrap items-center gap-3 ${props.onToggle ? 'pointer-events-none relative' : ''}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center border border-[var(--line-subtle)] bg-[var(--accent-soft)] shadow-[2px_2px_0_var(--line-subtle)]">
            <Icon aria-hidden="true" className="size-4 text-[var(--accent)]" />
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
        <div className="relative flex items-center gap-2">
          {props.action}
          {props.onRemove && (
            <button
              type="button"
              onClick={props.onRemove}
              className="ui-control flex size-7 cursor-pointer items-center justify-center text-[var(--faint)] hover:bg-[var(--panel-raised)] hover:text-rose-500"
              aria-label={`${props.title}を削除する`}
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
        {props.onToggle && (
          <ChevronDown
            aria-hidden="true"
            className={`pointer-events-none relative size-4 shrink-0 text-[var(--faint)] transition-transform ${props.expanded ? '' : '-rotate-90'}`}
          />
        )}
      </div>
      <div
        id={props.contentId}
        hidden={props.expanded === false}
        className={`mt-4 ${props.contentClassName ?? ''}`}
      >
        {props.children}
      </div>
    </section>
  );
}
