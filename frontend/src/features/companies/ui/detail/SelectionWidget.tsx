import { Check, ChevronDown, Clock3, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  initialSelectionTracks,
  type SelectionResult,
  type SelectionTrack,
} from "@/features/companies/model/companyDetail";
import { SelectionTrackDialog } from "@/features/companies/ui/detail/SelectionTrackDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import { AddButton } from "@/shared/button";
import { SelectionStatusBadge } from "../selection-step-badge";

const resultStyle: Record<SelectionResult, string> = {
  not_started: "border-[var(--line)] text-[var(--faint)]",
  pending: "border-amber-500/50 bg-amber-500/10 text-amber-600",
  passed: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
  failed: "border-rose-500/50 bg-rose-500/10 text-rose-500",
};

function ResultIcon({ result }: { result: SelectionResult }) {
  if (result === "passed") return <Check className="size-3" />;
  if (result === "failed") return <X className="size-3" />;
  if (result === "pending") return <Clock3 className="size-3" />;
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
    <AddButton
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
                        
                      <SelectionStatusBadge
                        result={step.result}
                        size="s"
                      />

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
