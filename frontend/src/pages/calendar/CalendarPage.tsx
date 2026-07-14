import { useState } from "react";
import { useCalendar } from "@/features/calendar/hooks/useCalendar";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import { CalendarHeader } from "@/features/calendar/ui/CalendarHeader";
import { CalendarMonth } from "@/features/calendar/ui/CalendarMonth";
import { EventDialog } from "@/features/calendar/ui/EventDialog";
import { UpcomingEvents } from "@/features/calendar/ui/UpcomingEvents";

export function CalendarPage() {
  const calendar = useCalendar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

  function openAddDialog() {
    setEditingEvent(undefined);
    setIsDialogOpen(true);
  }

  function openEditDialog(event: CalendarEvent) {
    setEditingEvent(event);
    setIsDialogOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <CalendarHeader displayDate={calendar.displayDate} category={calendar.category} format={calendar.format} status={calendar.status} onCategoryChange={calendar.setCategory} onFormatChange={calendar.setFormat} onStatusChange={calendar.setStatus} onDateChange={calendar.setDisplayDate} onPreviousMonth={() => calendar.moveMonth(-1)} onNextMonth={() => calendar.moveMonth(1)} onToday={calendar.goToToday} onAddEvent={openAddDialog} />
      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <CalendarMonth
          days={calendar.days}
          events={calendar.events}
          onEdit={openEditDialog}
          onDelete={calendar.deleteEvent}
        />
        <UpcomingEvents
          events={calendar.upcomingEvents}
          onEdit={openEditDialog}
          onDelete={calendar.deleteEvent}
        />
      </div>
      {isDialogOpen && <EventDialog event={editingEvent} onClose={() => setIsDialogOpen(false)} onSave={calendar.saveEvent} />}
    </div>
  );
}
