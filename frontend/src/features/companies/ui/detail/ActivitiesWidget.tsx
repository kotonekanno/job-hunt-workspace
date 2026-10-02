import { Building2, MessageSquareText } from 'lucide-react';
import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  initialActivities,
  type ActivitySender,
  type CompanyActivity,
} from '@/features/companies/model/activity';
import { ActivityComposer } from '@/features/companies/ui/detail/ActivityComposer';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { cn } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
});
const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
});

export function ActivitiesWidget() {
  const [activities, setActivities] =
    useState<CompanyActivity[]>(initialActivities);
  const [scrollEdges, setScrollEdges] = useState({ top: false, bottom: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateScrollEdges = useCallback(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    const top = viewport.scrollTop > 1;
    const bottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight > 1;
    setScrollEdges((current) =>
      current.top === top && current.bottom === bottom
        ? current
        : { top, bottom },
    );
  }, []);

  useLayoutEffect(() => {
    const viewport = scrollRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
    updateScrollEdges();
  }, [activities, updateScrollEdges]);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(updateScrollEdges);
    if (scrollRef.current) observer.observe(scrollRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [updateScrollEdges]);

  function sendMessage(text: string, sender: ActivitySender) {
    setActivities((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        sender,
        text,
        sentAt: new Date().toISOString(),
      },
    ]);
  }

  return (
    <WidgetFrame
      title="やりとり履歴"
      code="ACTIVITIES"
      icon={MessageSquareText}
      className="flex h-[600px] min-w-0 flex-col lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:h-auto lg:min-h-[520px]"
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[var(--line-strong)] bg-[var(--panel-raised)]">
        <div className="relative min-h-0 flex-1 basis-0">
          <div
            ref={scrollRef}
            role="log"
            aria-label="やりとり履歴"
            aria-live="polite"
            tabIndex={0}
            onScroll={updateScrollEdges}
            className="h-full overflow-y-auto overscroll-contain p-3 sm:p-4"
          >
            <div
              ref={contentRef}
              className="flex min-h-full flex-col justify-end gap-4"
            >
              {activities.map((activity, index) => {
                const date = new Date(activity.sentAt);
                const previous = activities[index - 1];
                const showDate =
                  !previous ||
                  dateFormatter.format(date) !==
                    dateFormatter.format(new Date(previous.sentAt));
                const fromCompany = activity.sender === 'company';
                return (
                  <Fragment key={activity.id}>
                    {showDate && (
                      <div className="flex justify-center py-1">
                        <time
                          dateTime={activity.sentAt}
                          className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[10px] text-[var(--muted)]"
                        >
                          {dateFormatter.format(date)}
                        </time>
                      </div>
                    )}
                    <div
                      className={cn(
                        'flex items-end gap-2',
                        !fromCompany && 'flex-row-reverse',
                      )}
                    >
                      {fromCompany && (
                        <span
                          role="img"
                          aria-label="企業"
                          className="flex size-7 shrink-0 self-start items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--panel)] text-[var(--accent)]"
                        >
                          <Building2 aria-hidden="true" className="size-3.5" />
                        </span>
                      )}
                      <p
                        className={cn(
                          'min-w-0 max-w-[70%] whitespace-pre-wrap break-words rounded-xl border px-3 py-2.5 text-xs leading-6 [overflow-wrap:anywhere]',
                          fromCompany
                            ? 'rounded-tl-none border-[var(--line)] bg-[var(--panel)] text-[var(--text)]'
                            : 'rounded-tr-none border-[var(--line-strong)] bg-[var(--accent-soft)] text-[var(--text-strong)]',
                        )}
                      >
                        {activity.text}
                      </p>
                      <time
                        dateTime={activity.sentAt}
                        className="shrink-0 pb-1 font-mono text-[9px] text-[var(--faint)]"
                      >
                        {timeFormatter.format(date)}
                      </time>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
          {scrollEdges.top && (
            <div
              aria-hidden="true"
              data-scroll-shadow="top"
              className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[var(--shadow)] to-transparent"
            />
          )}
          {scrollEdges.bottom && (
            <div
              aria-hidden="true"
              data-scroll-shadow="bottom"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[var(--shadow)] to-transparent"
            />
          )}
        </div>
        <ActivityComposer onSend={sendMessage} />
      </div>
    </WidgetFrame>
  );
}
