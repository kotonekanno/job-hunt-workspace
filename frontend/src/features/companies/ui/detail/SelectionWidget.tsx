import { Check, ChevronDown, Clock3, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  initialSelectionTracks,
  type SelectionResult,
  type SelectionTrack,
} from "@/features/companies/model/companyDetail";
import { SelectionTrackDialog } from "@/features/companies/ui/detail/SelectionTrackDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import { ColoredAddButton } from "@/shared/button";

const resultStyle: Record<SelectionResult, string> = {
  未受験: "border-[var(--line)] text-[var(--faint)]",
  結果待ち: "border-amber-500/50 bg-amber-500/10 text-amber-600",
  合格: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
  不合格: "border-rose-500/50 bg-rose-500/10 text-rose-500",
};

function ResultIcon({ result }: { result: SelectionResult }) {
  if (result === "合格") return <Check className="size-3" />;
  if (result === "不合格") return <X className="size-3" />;
  if (result === "結果待ち") return <Clock3 className="size-3" />;
  return <Minus className="size-3" />;
}

export function SelectionWidget() {
  const [tracks, setTracks] = useState(initialSelectionTracks);
  const [editingTrack, setEditingTrack] = useState<SelectionTrack | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function saveTrack(track: SelectionTrack) {
    const exists = tracks.some((item) => item.id === track.id);

    if (exists) {
      setTracks((current) => current.map((item) =>
        item.id === track.id ? track : item));
      return;
    }

    setTracks((current) => [...current, track]);
  }

  function updateStepResult(
    trackId: number,
    stepId: number,
    result: SelectionResult,
  ) {
    setTracks((current) => current.map((track) =>
      track.id === trackId
        ? {
            ...track,
            steps: track.steps.map((step) =>
              step.id === stepId ? { ...step, result } : step),
          }
        : track));
  }

  const addButton = (
    <ColoredAddButton
      text="選考を追加"
      size="s"
      onClick={() => {
        setEditingTrack(undefined);
        setIsDialogOpen(true);
      }}
    />
  );

  return (
    <>
      <WidgetFrame
        title="選考状況"
        code="SELECTION_PROCESS"
        action={addButton}
      >
        <div className="space-y-2">
          {tracks.map((track) => (
            <details
              key={track.id}
              className="group border border-[var(--line)] bg-[var(--panel-raised)]"
            >
              <summary className="flex list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                <h3 className="min-w-0 flex-1 truncate text-xs font-bold text-[var(--text-strong)]">
                  {track.name}
                </h3>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setEditingTrack(track);
                    setIsDialogOpen(true);
                  }}
                  className="flex size-7 items-center justify-center text-[var(--muted)] hover:text-[var(--accent)]"
                  aria-label={`${track.name}を編集`}
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setTracks((current) => current.filter(
                      (item) => item.id !== track.id,
                    ));
                  }}
                  className="flex size-7 items-center justify-center text-[var(--muted)] hover:text-rose-500"
                  aria-label={`${track.name}を削除`}
                >
                  <Trash2 className="size-3" />
                </button>
                <ChevronDown className="size-3.5 text-[var(--faint)] transition-transform group-open:rotate-180" />
              </summary>

              <div className="border-t border-[var(--line)] px-3 py-1">
                {track.steps.map((step) => (
                  <details key={step.id} className="group/step border-b border-[var(--line)] last:border-b-0">
                    <summary className="grid list-none grid-cols-[minmax(0,1fr)_48px_72px_14px] items-center gap-2 py-2.5 [&::-webkit-details-marker]:hidden">
                      <span className="truncate text-[10px] font-semibold text-[var(--text-strong)]">
                        {step.name}
                      </span>
                      <time className="font-mono text-[9px] font-bold text-[var(--accent)]">
                        {step.date ? step.date.slice(5).replace("-", "/") : "--/--"}
                      </time>
                      <span className={`flex items-center justify-center gap-1 border px-1 py-0.5 ${resultStyle[step.result]}`}>
                        <ResultIcon result={step.result} />
                        <select
                          value={step.result}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => updateStepResult(
                            track.id,
                            step.id,
                            event.target.value as SelectionResult,
                          )}
                          className="bg-transparent text-[8px] font-semibold outline-none"
                          aria-label={`${step.name}の選考状況`}
                        >
                          <option value="未受験">未受験</option>
                          <option value="結果待ち">結果待ち</option>
                          <option value="合格">合格</option>
                          <option value="不合格">不合格</option>
                        </select>
                      </span>
                      <ChevronDown className="size-3 text-[var(--faint)] transition-transform group-open/step:rotate-180" />
                    </summary>
                    <p className="border-t border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-[9px] leading-relaxed text-[var(--muted)]">
                      {step.memo}
                    </p>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      </WidgetFrame>

      {isDialogOpen && (
        <SelectionTrackDialog
          track={editingTrack}
          onClose={() => setIsDialogOpen(false)}
          onSave={saveTrack}
        />
      )}
    </>
  );
}
