import type { Event } from '@/api/generated/models/event';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import {
  useCompanyEvents,
  selectCompanyEvents,
} from '@/features/companies/hooks/useCompanyEvents';
import { CalendarDays, History } from 'lucide-react';
import { useState } from 'react';
import type { CalendarEvent } from '@/features/calendar/model/calendar';
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
  companyId,
  companyName,
  companies,
  initialEvents,
  prepareCompanies,
}: {
  companyId: number;
  companyName: string;
  companies: CompanyListItem[];
  initialEvents: Event[];
  prepareCompanies: () => Promise<boolean>;
}) {
  const { events, saveEvent, deleteEvent } = useCompanyEvents(
    companyId,
    companies,
    initialEvents,
  );
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const todayKey = getTodayKey();
  const visibleEvents = selectCompanyEvents(events, todayKey, showPastEvents);

  async function openEditDialog(event: CalendarEvent) {
    if (!(await prepareCompanies())) return;
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
        onClick={async () => {
          if (!(await prepareCompanies())) return;
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
        contentClassName="max-h-[28rem] overflow-y-auto"
      >
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
          companyOptions={companies.map((company) => company.name)}
          defaultCompany={companyName}
          onClose={() => setIsDialogOpen(false)}
          onSave={saveEvent}
        />
      )}
    </>
  );
}
