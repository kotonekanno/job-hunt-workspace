import { authenticatedRequest } from '@/api/authenticatedRequest';
import * as api from '@/api/generated/api';
import { requireStatus, useApiResource } from '@/api/useApiResource';
import {
  getEventEndDate,
  getEventSortKey,
} from '@/features/calendar/lib/eventTime';
import { toDateKey } from '@/features/calendar/lib/calendar';
import { RequestStatus } from '@/shared/RequestStatus';
import { CalendarDays, History } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { Event, CreateEventRequest } from '@/api/generated/models';
import { EventDialog } from '@/features/calendar/ui/EventDialog';
import { EventListItem } from '@/features/calendar/ui/EventListItem';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { AddButton } from '@/shared/button';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

export function RelatedEventsWidget({
  companyId,
  companyName,
}: {
  companyId: number;
  companyName: string;
}) {
  const loader = useCallback(
    async (signal: AbortSignal) => {
      const response = await authenticatedRequest(
        (options) => api.getCompanyById(companyId, options),
        { signal },
      );
      if (response.status !== 200)
        throw new Error('関連イベントを取得できませんでした。');
      return response.data.events;
    },
    [companyId],
  );
  const resource = useApiResource(loader);
  const [editingEvent, setEditingEvent] = useState<Event>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const visibleEvents = [...(resource.data ?? [])]
    .filter(
      (event) =>
        showPastEvents || getEventEndDate(event) >= toDateKey(new Date()),
    )
    .sort((a, b) => getEventSortKey(a).localeCompare(getEventSortKey(b)));
  async function saveEvent(request: CreateEventRequest, id?: number) {
    requireStatus(
      id === undefined
        ? await authenticatedRequest((options) =>
            api.createEvent(request, options),
          )
        : await authenticatedRequest((options) =>
            api.patchEvent(id, request, options),
          ),
      id === undefined ? 201 : 204,
    );
    await resource.refresh();
  }
  async function deleteEvent(id: number) {
    requireStatus(
      await authenticatedRequest((options) => api.deleteEvent(id, options)),
    );
    await resource.refresh();
  }
  function openEditDialog(event: Event) {
    setEditingEvent({ ...event, companyName });
    setIsDialogOpen(true);
  }

  const actions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-pressed={showPastEvents}
        onClick={() => setShowPastEvents((current) => !current)}
        className={`inline-flex h-8 cursor-pointer items-center gap-1.5 border px-2.5 text-[10px] font-semibold transition-colors ${
          showPastEvents
            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]'
        }`}
      >
        <History className="size-3.5" />
        過去の予定を表示
      </button>

      <AddButton
        text="予定を追加"
        size="s"
        onClick={() => {
          setEditingEvent(undefined);
          setIsDialogOpen(true);
        }}
      />
    </div>
  );

  return (
    <>
      <WidgetFrame
        title="関連イベント"
        code="RELATED_EVENTS"
        icon={CalendarDays}
        action={actions}
      >
        <RequestStatus isLoading={resource.isLoading} error={resource.error} />
        <div className="space-y-2">
          {visibleEvents.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onEdit={openEditDialog}
              onDelete={deleteEvent}
              showCompany={false}
            />
          ))}

          {visibleEvents.length === 0 && (
            <WidgetEmptyState text="表示できる予定はありません" />
          )}
        </div>
      </WidgetFrame>

      {isDialogOpen && (
        <EventDialog
          event={editingEvent}
          defaultCompany={companyName}
          onClose={() => setIsDialogOpen(false)}
          onSave={saveEvent}
        />
      )}
    </>
  );
}
