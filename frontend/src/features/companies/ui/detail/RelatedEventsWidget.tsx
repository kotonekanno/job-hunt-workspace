import { CalendarDays, History } from 'lucide-react';
import { useState } from 'react';
import type { CalendarEvent } from '@/features/calendar/model/calendar';
import type { Event, EventCategory } from '@/api/generated/models';
import { EventDialog } from '@/features/calendar/ui/EventDialog';
import { EventListItem } from '@/features/calendar/ui/EventListItem';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { AddButton } from '@/shared/button';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${date}`;
}

export function RelatedEventsWidget({
  events: initialEvents,
  companyName,
}: {
  events: Event[];
  companyName: string;
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const todayKey = getTodayKey();
  const visibleEvents = [...events]
    .filter(
      (event) =>
        showPastEvents ||
        (event.startDay ?? event.startTime?.slice(0, 10) ?? '') >= todayKey,
    )
    .sort((left, right) =>
      (left.startDay ?? left.startTime ?? '').localeCompare(
        right.startDay ?? right.startTime ?? '',
      ),
    );

  const categoryForApi: Record<CalendarEvent['category'], EventCategory> = {
    session: 'SESSION',
    interview: 'INTERVIEW',
    chat: 'CHAT',
    internship: 'INTERNSHIP',
    other: 'OTHER',
  };
  const categoryForForm: Record<EventCategory, CalendarEvent['category']> = {
    SESSION: 'session',
    INTERVIEW: 'interview',
    CHAT: 'chat',
    INTERNSHIP: 'internship',
    OTHER: 'other',
  };
  function saveEvent(form: Omit<CalendarEvent, 'id'>, id?: number) {
    const event: Event = {
      id: id ?? Math.max(0, ...events.map((item) => item.id)) + 1,
      companyName,
      category: categoryForApi[form.category],
      title: form.title,
      note: form.note,
      isAllDay: form.isAllDay,
      isOnline: form.isOnline,
      isAttending: form.isAttending,
      startDay: form.isAllDay ? form.startDate : null,
      endDay: form.isAllDay ? form.endDate : null,
      startTime: form.isAllDay
        ? null
        : new Date(
            `${form.startDate}T${form.startTime ?? '00:00'}`,
          ).toISOString(),
      endTime: form.isAllDay
        ? null
        : new Date(`${form.endDate}T${form.endTime ?? '00:00'}`).toISOString(),
    };
    setEvents((current) =>
      id === undefined
        ? [...current, event]
        : current.map((item) => (item.id === id ? event : item)),
    );
  }
  function openEditDialog(event: Event) {
    const start = event.startTime ? new Date(event.startTime) : undefined;
    const end = event.endTime ? new Date(event.endTime) : undefined;
    const time = (date?: Date) =>
      date?.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    // The dialog owns a date/time form; API data remains in its generated shape.
    setEditingEvent({
      id: event.id,
      company: companyName,
      category: categoryForForm[event.category],
      title: event.title,
      note: event.note,
      isAllDay: event.isAllDay,
      isOnline: event.isOnline,
      isAttending: event.isAttending ?? undefined,
      startDate: event.startDay ?? start?.toLocaleDateString('sv-SE') ?? '',
      endDate: event.endDay ?? end?.toLocaleDateString('sv-SE') ?? '',
      startTime: time(start),
      endTime: time(end),
    });
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
        <div className="space-y-2">
          {visibleEvents.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onEdit={openEditDialog}
              onDelete={(id) =>
                setEvents((current) =>
                  current.filter((event) => event.id !== id),
                )
              }
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
