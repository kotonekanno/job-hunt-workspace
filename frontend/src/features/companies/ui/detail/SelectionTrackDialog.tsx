import { Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type {
  SelectionStep,
  SelectionTrack,
} from "@/features/companies/model/companyDetail";
import { CancelButton, ColoredSubmitButton } from "@/shared/button";

type SelectionTrackDialogProps = {
  track?: SelectionTrack;
  onClose: () => void;
  onSave: (track: SelectionTrack) => void;
};

export function SelectionTrackDialog(props: SelectionTrackDialogProps) {
  const [name, setName] = useState(props.track?.name ?? "");
  const [steps, setSteps] = useState<SelectionStep[]>(
    props.track?.steps ?? [createEmptyStep()],
  );

  function createEmptyStep(): SelectionStep {
    return {
      id: Date.now() + Math.random(),
      name: "",
      memo: "",
      result: "未受験",
    };
  }

  function updateStep(id: number, patch: Partial<SelectionStep>) {
    setSteps((current) => current.map((step) =>
      step.id === id ? { ...step, ...patch } : step));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    props.onSave({
      id: props.track?.id ?? Date.now(),
      name,
      steps,
    });
    props.onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm"
      onMouseDown={props.onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="cyber-cut max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <h2 className="text-base font-bold text-[var(--text-strong)]">
            {props.track ? "選考を編集" : "選考を追加"}
          </h2>
          <button type="button" onClick={props.onClose}>
            <X className="size-4 text-[var(--muted)]" />
          </button>
        </div>

        <label className="mt-5 block text-xs text-[var(--muted)]">
          選考の種類
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例：本選考"
            className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </label>

        <div className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="border border-[var(--line)] bg-[var(--panel-raised)] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] font-bold text-[var(--accent)]">
                  STEP {index + 1}
                </p>
                <button
                  type="button"
                  disabled={steps.length === 1}
                  onClick={() => setSteps((current) => current.filter(
                    (item) => item.id !== step.id,
                  ))}
                  className="flex size-7 items-center justify-center text-[var(--muted)] hover:text-rose-500 disabled:opacity-30"
                  aria-label={`ステップ${index + 1}を削除`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px]">
                <label className="text-xs text-[var(--muted)]">
                  選考ステップの名前
                  <input
                    required
                    value={step.name}
                    onChange={(event) => updateStep(step.id, {
                      name: event.target.value,
                    })}
                    className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>

                <label className="text-xs text-[var(--muted)]">
                  日付（任意）
                  <input
                    type="date"
                    value={step.date ?? ""}
                    onChange={(event) => updateStep(step.id, {
                      date: event.target.value || undefined,
                    })}
                    className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>

                <label className="text-xs text-[var(--muted)] sm:col-span-2">
                  メモ
                  <textarea
                    value={step.memo}
                    onChange={(event) => updateStep(step.id, {
                      memo: event.target.value,
                    })}
                    className="mt-1 min-h-20 w-full resize-y border border-[var(--line)] bg-[var(--panel)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSteps((current) => [
            ...current,
            createEmptyStep(),
          ])}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 border border-dashed border-[var(--line-strong)] text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          <Plus className="size-3.5" />
          選考ステップを追加
        </button>

        <div className="mt-6 flex justify-end gap-2">
          <CancelButton
            onClick={props.onClose}
          />
          <ColoredSubmitButton
            text="保存する"
          />
        </div>
      </form>
    </div>
  );
}
