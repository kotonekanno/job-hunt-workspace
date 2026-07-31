import { Plus, Trash2 } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import type {
  SelectionStep,
  SelectionTrack,
} from "@/features/companies/model/companyDetail";
import {
  DeleteDialog,
  DialogActions,
  DialogBase,
  DialogHeader,
} from "@/shared/dialog";
import { RequiredMark } from "@/shared/form";

type SelectionTrackDialogProps = {
  track?: SelectionTrack;
  onClose: () => void;
  onSave: (track: SelectionTrack) => void;
};

export function SelectionTrackDialog(props: SelectionTrackDialogProps) {
  const titleId = useId();
  const [name, setName] = useState(props.track?.name ?? "");
  const [steps, setSteps] = useState<SelectionStep[]>(
    props.track?.steps ?? [createEmptyStep()],
  );
  const [pendingStepId, setPendingStepId] = useState<number>();

  function createEmptyStep(): SelectionStep {
    return {
      id: Date.now() + Math.random(),
      name: "",
      memo: "",
      result: "not_started",
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
    <DialogBase onClose={props.onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
        className="cyber-cut max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_20px_60px_var(--shadow)]"
      >
        <DialogHeader
          title={props.track ? "選考を編集" : "選考を追加"}
          titleId={titleId}
          onClose={props.onClose}
        />

        <label className="mt-5 block text-xs text-[var(--muted)]">
          選考の種類
          <RequiredMark />
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
                <p className="font-mono text-xs font-black tracking-[0.08em] text-[var(--accent)]">
                  STEP {index + 1}
                </p>
                <button
                  type="button"
                  disabled={steps.length === 1}
                  onClick={() => setPendingStepId(step.id)}
                  className="flex size-7 cursor-pointer items-center justify-center text-[var(--muted)] hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`ステップ${index + 1}を削除`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px]">
                <label className="text-xs text-[var(--muted)]">
                  選考ステップの名前
                  <RequiredMark />
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
                  日付
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

        <DialogActions
          onClose={props.onClose}
          confirmText="保存する"
          confirmType="submit"
        />
      </form>

      {pendingStepId !== undefined && (
        <DeleteDialog
          title="選考ステップを削除しますか？"
          text={`「${steps.find((step) => step.id === pendingStepId)?.name || "名称未設定のステップ"}」を削除します。この操作は取り消せません。`}
          onClose={() => setPendingStepId(undefined)}
          onConfirm={() => {
            setSteps((current) => current.filter(
              (step) => step.id !== pendingStepId,
            ));
            setPendingStepId(undefined);
          }}
        />
      )}
    </DialogBase>
  );
}
