import { Plus } from "lucide-react";
import { useState } from "react";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { EventDialog } from "@/features/calendar/ui/EventDialog";
import { EventListItem } from "@/features/calendar/ui/EventListItem";
import { relatedEvents } from "@/features/companies/model/companyDetail";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import { AddButton } from "@/shared/button";

export function RelatedEventsWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>(relatedEvents);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const addButton = (
    <AddButton
      text="予定を追加"
      size="s"
      onClick={() => {
        setEditingEvent(undefined);
        setIsDialogOpen(true);
      }}
    />
  );

  return (
    <>
      <WidgetFrame
        title="関連イベント"
        code="RELATED_EVENTS"
        action={addButton}
      >
        <div className="space-y-2">
          {events.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onEdit={openEditDialog}
              showCompany={false}
            />
          ))}
        </div>
      </WidgetFrame>

      {isDialogOpen && (
        <EventDialog
          event={editingEvent}
          onClose={() => setIsDialogOpen(false)}
          onSave={saveEvent}
        />
      )}
    </>
  );
}
