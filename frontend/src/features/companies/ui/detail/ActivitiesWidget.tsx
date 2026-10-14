import { useParams } from 'react-router-dom';
import { useMockActivities } from '@/features/companies/model/companyMockStore';
import { Building2, MessageSquareText } from 'lucide-react';
import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  type ActivitySender,
  type CompanyActivity,
} from '@/features/companies/model/activity';
import { ActivityComposer } from '@/features/companies/ui/detail/ActivityComposer';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { cn } from '@/lib/utils';
import {
  ActivityMessageMenu,
  type ActivityEditField,
} from '@/features/companies/ui/detail/ActivityMessageMenu';
import { ActivityEditDialog } from '@/features/companies/ui/detail/ActivityEditDialog';
import { DeleteDialog } from '@/shared/dialog';

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

export function ActivitiesWidget({
  readOnly = false,
  targetCompanyId,
}: {
  readOnly?: boolean;
  targetCompanyId?: number;
}) {
  const { companyId } = useParams();
  const [activities, setActivities] = useMockActivities(
    targetCompanyId ?? Number(companyId),
  );
  const [scrollEdges, setScrollEdges] = useState({ top: false, bottom: false });
  const [editing, setEditing] = useState<{
    activity: CompanyActivity;
    field: ActivityEditField;
  }>();
  const [deleting, setDeleting] = useState<CompanyActivity>();
  const orderedActivities = [...activities].sort(
    (a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt),
  );
  const scrollToEndRef = useRef(true);
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
    if (viewport && scrollToEndRef.current)
      viewport.scrollTop = viewport.scrollHeight;
    scrollToEndRef.current = false;
    updateScrollEdges();
  }, [activities, updateScrollEdges]);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(updateScrollEdges);
    if (scrollRef.current) observer.observe(scrollRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [updateScrollEdges]);

  function sendMessage(text: string, sender: ActivitySender) {
    scrollToEndRef.current = true;
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

  const content = (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[var(--line-strong)] bg-[var(--panel-raised)]">
        <div className="relative min-h-0 flex-1 basis-0">
          <div
            ref={scrollRef}
            role="log"
            aria-label="やりとり履歴"
            aria-live="polite"
            tabIndex={0}
            onScroll={updateScrollEdges}
            className="h-full overflow-y-auto p-3 sm:p-4"
          >
            <div
              ref={contentRef}
              className="flex min-h-full flex-col justify-end gap-4"
            >
              {orderedActivities.map((activity, index) => {
                const date = new Date(activity.sentAt);
                const previous = orderedActivities[index - 1];
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
                      <div
                        className={cn(
                          'flex min-w-0 max-w-[70%] items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-6',
                          fromCompany
                            ? 'rounded-tl-none border-[var(--line)] bg-[var(--panel)] text-[var(--text)]'
                            : 'rounded-tr-none border-[var(--line-strong)] bg-[var(--accent-soft)] text-[var(--text-strong)]',
                        )}
                      >
                        <p className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {activity.text}
                        </p>
                        {!readOnly && (
                          <ActivityMessageMenu
                            sender={activity.sender}
                            onSenderChange={(sender) =>
                              setActivities((current) =>
                                current.map((item) =>
                                  item.id === activity.id
                                    ? { ...item, sender }
                                    : item,
                                ),
                              )
                            }
                            onEdit={(field) => setEditing({ activity, field })}
                            onDelete={() => setDeleting(activity)}
                          />
                        )}
                      </div>
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
        {!readOnly && <ActivityComposer onSend={sendMessage} />}
      </div>
      {editing && (
        <ActivityEditDialog
          {...editing}
          onClose={() => setEditing(undefined)}
          onSave={(updated) =>
            setActivities((current) =>
              current.map((activity) =>
                activity.id === updated.id ? updated : activity,
              ),
            )
          }
        />
      )}
      {deleting && (
        <DeleteDialog
          title="メッセージを削除しますか？"
          text={`「${deleting.text}」を削除します。`}
          onClose={() => setDeleting(undefined)}
          onConfirm={() => {
            setActivities((current) =>
              current.filter((activity) => activity.id !== deleting.id),
            );
            setDeleting(undefined);
          }}
        />
      )}
    </>
  );
  if (readOnly)
    return (
      <div className="flex h-[360px] max-h-[60vh] min-w-0 flex-col">
        {content}
      </div>
    );
  return (
    <WidgetFrame
      title="やりとり履歴"
      code="ACTIVITIES"
      icon={MessageSquareText}
      className="flex h-[600px] min-w-0 flex-col lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:h-auto lg:min-h-[520px]"
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      {content}
    </WidgetFrame>
  );
}
