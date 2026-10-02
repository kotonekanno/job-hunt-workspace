import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  eventCategories,
  eventCategoryLabels,
  type EventCategory,
} from "@/features/calendar/model/calendar";
import type {
  AttendanceFilter,
  OnlineFilter,
} from "@/features/calendar/hooks/useCalendar";
import {
  Select,
  type SelectOption,
} from "@/shared/select";

type CalendarFiltersProps = {
  displayDate: Date;
  category: EventCategory | "すべて";
  format: OnlineFilter;
  status: AttendanceFilter;
  onCategoryChange: (value: EventCategory | "すべて") => void;
  onFormatChange: (value: OnlineFilter) => void;
  onStatusChange: (value: AttendanceFilter) => void;
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
              ...eventCategories.map((category) => ({
                value: category,
                label: eventCategoryLabels[category],
              })),
            ]}
            onValueChange={props.onCategoryChange}
            aria-label="予定種別で絞り込む"
          />
          
          <Select
            value={props.format}
            options={[
              { value: "すべて", label: "すべての形式" },
              { value: "online", label: "オンライン" },
              { value: "offline", label: "オフライン" },
            ]}
            onValueChange={props.onFormatChange}
            aria-label="実施形式で絞り込む"
          />

          <Select
            value={props.status}
            options={[
              { value: "すべて", label: "すべての参加状況" },
              { value: "attending", label: "参加" },
              { value: "notAttending", label: "不参加" },
            ]}
            onValueChange={props.onStatusChange}
            aria-label="参加状況で絞り込む"
          />

        </div>

      </div>
    </div>
  );
}
