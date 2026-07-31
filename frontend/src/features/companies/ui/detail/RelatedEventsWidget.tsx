import {
  CalendarDays,
  History,
} from "lucide-react";
import { useState } from "react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { getEventSortKey } from "@/features/calendar/lib/eventTime";
import { EventDialog } from "@/features/calendar/ui/EventDialog";
import { EventListItem } from "@/features/calendar/ui/EventListItem";
import {
  companyProfile,
  relatedEvents,
} from "@/features/companies/model/companyDetail";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import { AddButton } from "@/shared/button";

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

export function RelatedEventsWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>(relatedEvents);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const todayKey = getTodayKey();
  const visibleEvents = [...events]
    .filter((event) => showPastEvents || event.date >= todayKey)
    .sort((left, right) =>
      getEventSortKey(left).localeCompare(getEventSortKey(right)));

  function saveEvent(event: Omit<CalendarEvent, "id">, id?: number) {
    if (id !== undefined) {
      setEvents((current) => current.map((item) =>
        item.id === id ? { ...event, id } : item));
      return;
    }

    setEvents((current) => [
      ...current,
      {
        ...event,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
      },
    ]);
  }

  function openEditDialog(event: CalendarEvent) {
    setEditingEvent(event);
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
            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
            : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
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
              showCompany={false}
            />
          ))}

          {visibleEvents.length === 0 && (
            <p className="ui-empty-state border border-dashed border-[var(--line)] py-8 text-center text-xs text-[var(--faint)]">
              表示できる予定はありません
            </p>
          )}
        </div>
      </WidgetFrame>

      {isDialogOpen && (
        <EventDialog
          event={editingEvent}
          defaultCompany={companyProfile.name}
          onClose={() => setIsDialogOpen(false)}
          onSave={saveEvent}
        />
      )}
    </>
  );
}
