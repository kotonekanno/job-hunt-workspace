import {
  CalendarClock,
  CircleCheck,
  MapPin,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import {
  attendanceEnabledCategories,
  eventCategories,
  type CalendarEvent,
  type EventCategory,
  type EventFormat,
} from "@/features/calendar/model/calendar";
import { companyNameOptions } from "@/features/companies/model/companyList";
import { CompanyCombobox } from "@/shared/CompanyCombobox";
import { EditDialog } from "@/shared/dialog";
import { RequiredMark } from "@/shared/form";
import {
  Select,
  toSelectOptions,
} from "@/shared/select";

type EventDialogProps = {
  event?: CalendarEvent;
  defaultCompany?: string;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">, id?: number) => void;
};

const fieldClassName = `
  h-9 w-full border border-[var(--line)]
  bg-[var(--panel-raised)] px-3 text-xs text-[var(--text)]
  outline-none transition-colors hover:border-[var(--line-strong)]
  focus:border-[var(--accent)]
`;

export function EventDialog({
  event,
  defaultCompany,
  onClose,
  onSave,
}: EventDialogProps) {
  const initialDate = event?.date ?? getTodayDateKey();
  const [form, setForm] = useState<Omit<CalendarEvent, "id">>({
    title: event?.title ?? "",
    company: event?.company || defaultCompany || "",
    category: event?.category ?? "説明会",
    allDay: event?.allDay ?? false,
    date: initialDate,
    endDate: event?.endDate ?? initialDate,
    startTime: event?.startTime ?? "10:00",
    endTime: event?.endTime ?? "11:00",
    format: event?.format ?? "オンライン",
    status: event?.status ?? "参加",
    memo: event?.memo ?? "",
  });
  const canSelectAttendance = attendanceEnabledCategories.includes(
    form.category,
  );

  function changeCategory(category: EventCategory) {
    setForm({
      ...form,
      category,
      status: form.status ?? "参加",
    });
  }

  function submit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    onSave({
      ...form,
      status: canSelectAttendance ? form.status ?? "参加" : undefined,
    }, event?.id);
    onClose();
  }

  return (
    <EditDialog
      title={event ? "予定を編集" : "予定を追加"}
      subTitle="// EVENT_EDITOR"
      onClose={onClose}
      onSubmit={submit}
      submitText="保存する"
      formClassName="max-h-[90vh] max-w-2xl overflow-y-auto p-6 sm:p-8"
      fieldsClassName="mt-5 grid gap-4 sm:grid-cols-2"
      titleClassName="text-lg"
    >
      <>
        <label className="text-xs text-[var(--muted)]">
          企業名
          <CompanyCombobox
            value={form.company}
            options={companyNameOptions}
            allowEmpty
            onValueChange={(company) => setForm({
              ...form,
              company,
            })}
            className="mt-1"
          />
        </label>

        <label className="text-xs text-[var(--muted)]">
          イベント名
          <RequiredMark />
          <input
            required
            value={form.title}
            onChange={(changeEvent) => setForm({
              ...form,
              title: changeEvent.target.value,
            })}
            className={`mt-1 ${fieldClassName}`}
          />
        </label>

        <label className="text-xs text-[var(--muted)]">
          予定種別
          <Select
            value={form.category}
            options={toSelectOptions(eventCategories)}
            onValueChange={changeCategory}
            className="mt-1 w-full"
          />
        </label>

        <div>
          <SwitchField
            label="終日"
            icon={CalendarClock}
            checked={form.allDay}
            onChange={(allDay) => setForm({
              ...form,
              allDay,
            })}
          />
        </div>

        <DateTimeField
          label="開始"
          date={form.date}
          time={form.startTime ?? "10:00"}
          timeDisabled={form.allDay}
          onDateChange={(date) => setForm({
            ...form,
            date,
            endDate: form.endDate < date ? date : form.endDate,
          })}
          onTimeChange={(startTime) => setForm({
            ...form,
            startTime,
          })}
        />

        <DateTimeField
          label="終了"
          date={form.endDate}
          time={form.endTime ?? "11:00"}
          minDate={form.date}
          timeDisabled={form.allDay}
          onDateChange={(endDate) => setForm({
            ...form,
            endDate,
          })}
          onTimeChange={(endTime) => setForm({
            ...form,
            endTime,
          })}
        />

        <div className="text-xs text-[var(--muted)]">
          実施形式
          <SegmentedControl<EventFormat>
            value={form.format}
            options={[
              {
                value: "オンライン",
                label: "オンライン",
                icon: Monitor,
              },
              {
                value: "オフライン",
                label: "オフライン",
                icon: MapPin,
              },
            ]}
            onChange={(format) => setForm({
              ...form,
              format,
            })}
          />
        </div>

        <SwitchField
          label="参加状況"
          icon={CircleCheck}
          checked={form.status !== "不参加"}
          checkedText="参加"
          uncheckedText="不参加"
          disabled={!canSelectAttendance}
          onChange={(isParticipating) => setForm({
            ...form,
            status: isParticipating ? "参加" : "不参加",
          })}
        />

        <label className="text-xs text-[var(--muted)] sm:col-span-2">
          メモ
          <textarea
            value={form.memo}
            onChange={(changeEvent) => setForm({
              ...form,
              memo: changeEvent.target.value,
            })}
            className="mt-1 min-h-24 w-full cursor-text resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none transition-colors hover:border-[var(--line-strong)] focus:border-[var(--accent)]"
            placeholder="準備することや確認事項など"
          />
        </label>
      </>
    </EditDialog>
  );
}

type DateTimeFieldProps = {
  label: string;
  date: string;
  time: string;
  minDate?: string;
  timeDisabled: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
};

function DateTimeField({
  label,
  date,
  time,
  minDate,
  timeDisabled,
  onDateChange,
  onTimeChange,
}: DateTimeFieldProps) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)]">
        {label}
      </p>

      <div className="mt-1 grid grid-cols-[minmax(0,1fr)_112px] gap-2">
        <input
          required
          type="date"
          min={minDate}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          aria-label={`${label}日`}
          className={fieldClassName}
        />

        <input
          required
          type="time"
          step={300}
          value={timeDisabled ? "" : time}
          disabled={timeDisabled}
          onChange={(event) => onTimeChange(event.target.value)}
          aria-label={`${label}時刻`}
          className={`${fieldClassName} disabled:cursor-not-allowed disabled:opacity-40`}
        />
      </div>
    </div>
  );
}

type SwitchFieldProps = {
  label: string;
  icon: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
  checkedText?: string;
  uncheckedText?: string;
  disabled?: boolean;
};

function SwitchField({
  label,
  icon: Icon,
  checked,
  onChange,
  checkedText = "オン",
  uncheckedText = "オフ",
  disabled = false,
}: SwitchFieldProps) {
  return (
    <div className="text-xs text-[var(--muted)]">
      {label}
      <div
        className={`mt-1 flex h-10 w-full items-center justify-between border px-3 transition-colors ${
          checked
            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
            : "border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)]"
        } ${disabled ? "opacity-40" : ""}`}
      >
        <span className="inline-flex items-center gap-2 text-xs font-bold">
          <Icon className="size-4" />
          {checked ? checkedText : uncheckedText}
        </span>

        <button
          type="button"
          role="switch"
          disabled={disabled}
          aria-label={label}
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-5 w-9 cursor-pointer border transition-colors ${
            checked
              ? "border-[var(--accent)] bg-[var(--accent)]"
              : "border-[var(--line-strong)] bg-[var(--panel)]"
          } disabled:cursor-not-allowed`}
        >
          <span
            className={`absolute left-0.5 top-0.5 size-3.5 bg-white shadow-sm transition-transform ${
              checked ? "translate-x-[18px]" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
};

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="mt-1 grid grid-cols-2 border border-[var(--line)] bg-[var(--panel)] p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`flex h-8 cursor-pointer items-center justify-center gap-1.5 px-2 text-[10px] font-bold transition-colors ${
              isSelected
                ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                : "text-[var(--muted)] hover:bg-[var(--panel-raised)] hover:text-[var(--text-strong)]"
            }`}
          >
            <Icon className="size-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}
