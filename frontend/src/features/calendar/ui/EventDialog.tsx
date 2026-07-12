import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { attendanceStatuses, eventCategories, eventFormats, type CalendarEvent } from "@/features/calendar/model/calendar";
import { CancelButton, ColoredSubmitButton } from "@/shared/button";

type EventDialogProps = {
  event?: CalendarEvent;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">, id?: number) => void;
};

export function EventDialog({ event, onClose, onSave }: EventDialogProps) {
  const [form, setForm] = useState<Omit<CalendarEvent, "id">>({ title: event?.title ?? "", company: event?.company ?? "", date: event?.date ?? "2026-07-12", time: event?.time ?? "10:00", category: event?.category ?? "説明会", format: event?.format ?? "オンライン", status: event?.status ?? "不確定", location: event?.location ?? "", memo: event?.memo ?? "" });

  function submit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    onSave(form, event?.id);
    onClose();
  }

  const fieldClassName = "mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()} className="cyber-cut max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)] sm:p-8">
        <div className="flex items-start justify-between border-b border-[var(--line)] pb-4"><div><p className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">// EVENT_EDITOR</p><h2 className="mt-1 text-lg font-bold text-[var(--text-strong)]">{event ? "予定を編集" : "予定を追加"}</h2></div><button type="button" onClick={onClose} className="flex size-8 items-center justify-center text-[var(--muted)] hover:text-[var(--text-strong)]"><X className="size-4" /></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-[var(--muted)]">企業名（任意）<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)]">イベント名<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)]">日付<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)]">時間<input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)]">予定種別<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CalendarEvent["category"] })} className={fieldClassName}>{eventCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs text-[var(--muted)]">実施形式<select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as CalendarEvent["format"] })} className={fieldClassName}>{eventFormats.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs text-[var(--muted)]">参加状況<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CalendarEvent["status"] })} className={fieldClassName}>{attendanceStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs text-[var(--muted)]">場所・URL<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={fieldClassName} /></label>
          <label className="text-xs text-[var(--muted)] sm:col-span-2">メモ<textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} className="mt-1 min-h-24 w-full resize-y border border-[var(--line)] bg-[var(--panel-raised)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="準備することや確認事項など" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <CancelButton
            onClick={onClose}
          />
          <ColoredSubmitButton text="保存する" />
        </div>
      </form>
    </div>
  );
}
