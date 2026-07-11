import { CalendarDays, ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { attendanceStatuses, eventCategories, eventFormats, type AttendanceStatus, type EventCategory, type EventFormat } from "@/features/calendar/model/calendar";

type CalendarFiltersProps = {
  displayDate: Date;
  category: EventCategory | "すべて";
  format: EventFormat | "すべて";
  status: AttendanceStatus | "すべて";
  onCategoryChange: (value: EventCategory | "すべて") => void;
  onFormatChange: (value: EventFormat | "すべて") => void;
  onStatusChange: (value: AttendanceStatus | "すべて") => void;
  onDateChange: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent: () => void;
};

export function CalendarHeader(props: CalendarFiltersProps) {
  const selectClassName = "h-9 border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-xs text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]";
  const years = Array.from({ length: 7 }, (_, index) => 2023 + index);

  return (
    <div className="cyber-cut border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_6px_24px_var(--shadow)] transition-colors duration-300">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={props.onPreviousMonth} className="flex size-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]" aria-label="前の月"><ChevronLeft className="size-4" /></button>
          <select value={props.displayDate.getFullYear()} onChange={(event) => props.onDateChange(new Date(Number(event.target.value), props.displayDate.getMonth(), 1))} className={selectClassName} aria-label="年を選択">{years.map((year) => <option key={year} value={year}>{year}年</option>)}</select>
          <select value={props.displayDate.getMonth()} onChange={(event) => props.onDateChange(new Date(props.displayDate.getFullYear(), Number(event.target.value), 1))} className={selectClassName} aria-label="月を選択">{Array.from({ length: 12 }, (_, month) => <option key={month} value={month}>{month + 1}月</option>)}</select>
          <button type="button" onClick={props.onNextMonth} className="flex size-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]" aria-label="次の月"><ChevronRight className="size-4" /></button>
          <button type="button" onClick={props.onToday} className="flex h-9 items-center gap-2 border border-[var(--line)] px-3 text-xs font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"><CalendarDays className="size-3.5" />今日</button>
        </div>


        <div className="flex flex-wrap items-center gap-2">

          <select
            value={props.category}
            onChange={(event) => props.onCategoryChange(event.target.value as EventCategory | "すべて")}
            className={selectClassName}
          >
            <option value="すべて">すべての予定</option>
            {eventCategories.map((item) =>
              <option key={item}>{item}</option>
            )}
          </select>

          <select
            value={props.format}
            onChange={(event) => props.onFormatChange(event.target.value as EventFormat | "すべて")}
            className={selectClassName}
          >
            <option value="すべて">すべての形式</option>
            {eventFormats.map((item) =>
              <option key={item}>{item}</option>
            )}
          </select>

          <select
            value={props.status}
            onChange={(event) => props.onStatusChange(event.target.value as AttendanceStatus | "すべて")}
            className={selectClassName}
          >
            <option value="すべて">すべての参加状況</option>
            {attendanceStatuses.map((item) =>
              <option key={item}>{item}</option>
            )}
          </select>

          <button
            type="button"
            onClick={props.onAddEvent}
            className="
              cyber-cut-sm flex h-9 items-center gap-2 bg-[var(--accent)] px-4
              text-xs font-bold text-[var(--accent-contrast)]
              transition-transform hover:-translate-y-0.5
            "
          >
            <Plus className="size-3.5" />
            予定を追加
          </button>
        </div>

      </div>
    </div>
  );
}