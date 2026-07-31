import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  attendanceStatuses,
  eventCategories,
  eventFormats,
  type AttendanceStatus,
  type EventCategory,
  type EventFormat,
} from "@/features/calendar/model/calendar";
import {
  Select,
  toSelectOptions,
  type SelectOption,
} from "@/shared/select";

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
};

export function CalendarHeader(props: CalendarFiltersProps) {
  const years = Array.from({ length: 7 }, (_, index) => 2023 + index);
  const months: SelectOption<number>[] = Array.from(
    { length: 12 },
    (_, index) => ({ value: index, label: `${index + 1}月` }),
  );

  return (
    <div className="ui-panel cyber-cut border border-[var(--line)] p-4 transition-colors duration-300">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={props.onPreviousMonth} className="flex size-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]" aria-label="前の月"><ChevronLeft className="size-4" /></button>
          <Select
            value={props.displayDate.getFullYear()}
            options={years.map((year) => ({
              value: year,
              label: `${year}年`,
            }))}
            onValueChange={(year) => props.onDateChange(new Date(
              year,
              props.displayDate.getMonth(),
              1,
            ))}
            aria-label="年を選択"
          />
          <Select
            value={props.displayDate.getMonth()}
            options={months}
            onValueChange={(month) => props.onDateChange(new Date(
              props.displayDate.getFullYear(),
              month,
              1,
            ))}
            aria-label="月を選択"
          />
          <button type="button" onClick={props.onNextMonth} className="flex size-9 items-center justify-center border border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]" aria-label="次の月"><ChevronRight className="size-4" /></button>
          <button type="button" onClick={props.onToday} className="flex h-9 items-center gap-2 border border-[var(--line)] px-3 text-xs font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"><CalendarDays className="size-3.5" />今日</button>
        </div>


        <div className="flex flex-wrap items-center gap-2">

          <Select
            value={props.category}
            options={[
              { value: "すべて", label: "すべての予定" },
              ...toSelectOptions(eventCategories),
            ]}
            onValueChange={props.onCategoryChange}
            aria-label="予定種別で絞り込む"
          />
          
          <Select
            value={props.format}
            options={[
              { value: "すべて", label: "すべての形式" },
              ...toSelectOptions(eventFormats),
            ]}
            onValueChange={props.onFormatChange}
            aria-label="実施形式で絞り込む"
          />

          <Select
            value={props.status}
            options={[
              { value: "すべて", label: "すべての参加状況" },
              ...toSelectOptions(attendanceStatuses),
            ]}
            onValueChange={props.onStatusChange}
            aria-label="参加状況で絞り込む"
          />

        </div>

      </div>
    </div>
  );
}
