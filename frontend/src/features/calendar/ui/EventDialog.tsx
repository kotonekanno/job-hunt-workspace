import { useState, type FormEvent } from "react";
import {
  attendanceStatuses,
  eventCategories,
  eventFormats,
  type CalendarEvent,
} from "@/features/calendar/model/calendar";
import { EditDialog } from "@/shared/dialog";
import { Select } from "@/shared/select";

type EventDialogProps = {
  event?: CalendarEvent;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">, id?: number) => void;
};

export function EventDialog({ event, onClose, onSave }: EventDialogProps) {
  const [form, setForm] = useState<Omit<CalendarEvent, "id">>({
    title: event?.title ?? "",
    company: event?.company ?? "",
    date: event?.date ?? "2026-07-12",
    time: event?.time ?? "10:00",
    category: event?.category ?? "説明会",
    format: event?.format ?? "オンライン",
    status: event?.status ?? "不確定",
    location: event?.location ?? "",
    memo: event?.memo ?? "",
  });

  function submit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    onSave(form, event?.id);
    onClose();
  }

  const fieldClassName = "mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]";

  const fields = (
    <>
      <label className="text-xs text-[var(--muted)]">
        企業名（任意）
        <input
          value={form.company}
          onChange={(changeEvent) => setForm({
            ...form,
            company: changeEvent.target.value,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        イベント名
        <input
          required
          value={form.title}
          onChange={(changeEvent) => setForm({
            ...form,
            title: changeEvent.target.value,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        日付
        <input
          required
          type="date"
          value={form.date}
          onChange={(changeEvent) => setForm({
            ...form,
            date: changeEvent.target.value,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        時間
        <input
          required
          type="time"
          value={form.time}
          onChange={(changeEvent) => setForm({
            ...form,
            time: changeEvent.target.value,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        予定種別
        <Select
          value={form.category}
          items={eventCategories}
          onChange={(changeEvent: any) => setForm({
            ...form,
            category: changeEvent.target.value as CalendarEvent["category"],
          })}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        実施形式
        <Select
          value={form.format}
          items={eventFormats}
          onChange={(changeEvent) => setForm({
            ...form,
            format: changeEvent.target.value as CalendarEvent["format"],
          })}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        参加状況
        <Select
          value={form.status}
          items={attendanceStatuses}
          onChange={(changeEvent) => setForm({
            ...form,
            status: changeEvent.target.value as CalendarEvent["status"],
          })}
        />
      </label>

      <label className="text-xs text-[var(--muted)]">
        場所・URL
        <input
          value={form.location}
          onChange={(changeEvent) => setForm({
            ...form,
            location: changeEvent.target.value,
          })}
          className={fieldClassName}
        />
      </label>

      <label className="text-xs text-[var(--muted)] sm:col-span-2">
        メモ
        <textarea
          value={form.memo}
          onChange={(changeEvent) => setForm({
            ...form,
            memo: changeEvent.target.value,
          })}
          className="mt-1 min-h-24 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          placeholder="準備することや確認事項など"
        />
      </label>
    </>
  );

  return (
    <EditDialog
      title={event ? "予定を編集" : "予定を追加"}
      subTitle="// EVENT_EDITOR"
      fields={fields}
      onClose={onClose}
      onSubmit={submit}
      submitText="保存する"
      formClassName="max-h-[90vh] max-w-2xl overflow-y-auto p-6 sm:p-8"
      fieldsClassName="mt-5 grid gap-4 sm:grid-cols-2"
      titleClassName="text-lg"
    />
  );
}
