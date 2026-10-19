import type { Activity } from '@/api/generated/models/activity';
import { ActivityComposer } from '@/features/companies/ui/detail/ActivityComposer';
import { ActivityEditDialog } from '@/features/companies/ui/detail/ActivityEditDialog';
import {
  ActivityMessageMenu,
  type ActivityEditField,
} from '@/features/companies/ui/detail/ActivityMessageMenu';
import { DeleteDialog } from '@/shared/dialog';
import { Building2 } from 'lucide-react';
import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { useCompanyActivities } from '@/features/companies/hooks/useCompanyActivities';
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

export function CompanyActivityHistory({
  companyId,
  editable = false,
  initialPage,
}: {
  companyId: number;
  editable?: boolean;
  initialPage?: Activity[];
}) {
  const { activities, loading, hasMore, loadNext, create, update, remove } =
    useCompanyActivities(companyId, initialPage);
  const viewportRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<{ height: number; top: number } | null>(null);
  const initial = useRef(true);
  const fetching = useRef(false);
  const touchY = useRef<number | null>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const [editing, setEditing] = useState<{
    activity: Activity;
    field: ActivityEditField;
  }>();
  const [deleting, setDeleting] = useState<Activity>();
  const mutating = useRef(false);
  async function mutate(action: () => Promise<boolean>, scrollToEnd = false) {
    if (mutating.current || loading || fetching.current) return false;
    mutating.current = true;
    if (scrollToEnd) initial.current = true;
    try {
      return await action();
    } finally {
      mutating.current = false;
    }
  }

  function updateEdges() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const top = viewport.scrollTop > 1;
    const bottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight > 1;
    setEdges((current) =>
      current.top === top && current.bottom === bottom
        ? current
        : { top, bottom },
    );
  }
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || activities.length === 0) return;
    if (initial.current) {
      viewport.scrollTop = viewport.scrollHeight;
      initial.current = false;
    } else if (anchor.current)
      viewport.scrollTop =
        anchor.current.top + viewport.scrollHeight - anchor.current.height;
    anchor.current = null;
    updateEdges();
  }, [activities]);

  async function fetchOlder() {
    const viewport = viewportRef.current;
    if (
      !viewport ||
      viewport.scrollTop > 1 ||
      loading ||
      fetching.current ||
      mutating.current ||
      !hasMore
    )
      return;
    fetching.current = true;
    anchor.current = { height: viewport.scrollHeight, top: viewport.scrollTop };
    try {
      if (!(await loadNext())) anchor.current = null;
    } finally {
      fetching.current = false;
    }
  }

  return (
    <div
      className={
        editable
          ? 'flex min-h-0 min-w-0 flex-1 flex-col'
          : 'flex h-[360px] max-h-[60vh] min-w-0 flex-col'
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[var(--line-strong)] bg-[var(--panel-raised)]">
        <div className="relative min-h-0 flex-1 basis-0">
          <div
            ref={viewportRef}
            role="log"
            aria-label="やりとり履歴"
            aria-live="polite"
            aria-busy={loading}
            tabIndex={0}
            onScroll={updateEdges}
            onWheel={(event) => {
              if (event.deltaY < 0) void fetchOlder();
            }}
            onTouchStart={(event) => {
              touchY.current = event.touches[0]?.clientY ?? null;
            }}
            onTouchMove={(event) => {
              const y = event.touches[0]?.clientY;
              if (
                y !== undefined &&
                touchY.current !== null &&
                y > touchY.current
              )
                void fetchOlder();
              touchY.current = y ?? null;
            }}
            onKeyDown={(event) => {
              if (['ArrowUp', 'PageUp', 'Home'].includes(event.key))
                void fetchOlder();
            }}
            className="h-full overflow-y-auto overscroll-contain p-3 sm:p-4"
            style={{ overflowAnchor: 'none' }}
          >
            <div className="flex min-h-full flex-col justify-end gap-4">
              {activities.map((activity, index) => {
                const date = new Date(activity.occurredAt);
                const previous = activities[index - 1];
                const showDate =
                  !previous ||
                  dateFormatter.format(date) !==
                    dateFormatter.format(new Date(previous.occurredAt));
                const fromCompany = activity.byUser !== true;
                return (
                  <Fragment key={activity.id}>
                    {showDate && (
                      <div className="flex justify-center py-1">
                        <time
                          dateTime={activity.occurredAt}
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
                        {editable && (
                          <ActivityMessageMenu
                            sender={activity.byUser ? 'user' : 'company'}
                            onSenderChange={(sender) => {
                              void mutate(() =>
                                update(activity.id, {
                                  byUser: sender === 'user',
                                }),
                              );
                            }}
                            onEdit={(field) => setEditing({ activity, field })}
                            onDelete={() => setDeleting(activity)}
                          />
                        )}
                      </div>
                      <time
                        dateTime={activity.occurredAt}
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
          {edges.top && (
            <div
              aria-hidden="true"
              data-scroll-shadow="top"
              className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[var(--shadow)] to-transparent"
            />
          )}
          {edges.bottom && (
            <div
              aria-hidden="true"
              data-scroll-shadow="bottom"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[var(--shadow)] to-transparent"
            />
          )}
        </div>
        {editable && (
          <ActivityComposer
            onSend={(text, sender) =>
              mutate(() => create(text, sender === 'user'), true)
            }
          />
        )}
      </div>
      {editing && (
        <ActivityEditDialog
          {...editing}
          onClose={() => setEditing(undefined)}
          onSave={(activity) =>
            mutate(() =>
              update(
                activity.id,
                editing.field === 'text'
                  ? { text: activity.text }
                  : { occurredAt: activity.occurredAt },
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
          onConfirm={async () => {
            if (await mutate(() => remove(deleting.id))) setDeleting(undefined);
          }}
        />
      )}
    </div>
  );
}
