import {
  CalendarDays,
  ChevronDown,
  GitBranch,
} from "lucide-react";
import { useState } from "react";
import {
  initialSelectionTracks,
  type SelectionTrack,
} from "@/features/companies/model/companyDetail";
import { SelectionTrackDialog } from "@/features/companies/ui/detail/SelectionTrackDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import { SelectionStatusBadge } from "@/features/companies/ui/selection-step-badge";
import {
  AddButton,
  DeleteIconButton,
  EditIconButton,
} from "@/shared/button";

export function SelectionWidget() {
  const [tracks, setTracks] = useState(initialSelectionTracks);
  const [editingTrack, setEditingTrack] = useState<SelectionTrack>();
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

  function openEditDialog(track: SelectionTrack) {
    setEditingTrack(track);
    setIsDialogOpen(true);
  }

  function removeTrack(trackId: number) {
    setTracks((current) => current.filter(
      (track) => track.id !== trackId,
    ));
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
        <div className="space-y-3">
          {tracks.map((track) => (
            <details
              key={track.id}
              className="group border border-[var(--line)] bg-[var(--panel-raised)] shadow-[0_3px_12px_var(--shadow)] transition-[border-color,box-shadow] open:border-[var(--line-strong)] hover:border-[var(--accent)] hover:shadow-[0_5px_16px_var(--shadow)]"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
                <span className="flex size-8 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
                  <GitBranch className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-black text-[var(--text-strong)]">
                    {track.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[8px] font-semibold tracking-[0.12em] text-[var(--faint)]">
                    {track.steps.length} SELECTION STEPS
                  </p>
                </div>

                <EditIconButton
                  size="s"
                  ariaLabel={`${track.name}を編集`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openEditDialog(track);
                  }}
                />

                <DeleteIconButton
                  size="s"
                  ariaLabel={`${track.name}を削除`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    removeTrack(track.id);
                  }}
                />

                <ChevronDown className="size-4 shrink-0 text-[var(--faint)] transition-transform duration-200 group-open:rotate-180" />
              </summary>

              <div className="border-t border-[var(--line)] bg-[var(--panel)] p-3">
                <div className="relative space-y-2 before:absolute before:top-5 before:bottom-5 before:left-[15px] before:w-px before:bg-[var(--line-strong)]">
                  {track.steps.map((step, stepIndex) => (
                    <details
                      key={step.id}
                      className="group/step relative"
                    >
                      <summary className="relative grid min-h-12 cursor-pointer list-none grid-cols-[32px_minmax(0,1fr)_auto_auto_14px] items-center gap-2 border border-[var(--line)] bg-[var(--panel-raised)] px-2.5 py-2 transition-colors hover:border-[var(--line-strong)] [&::-webkit-details-marker]:hidden">
                        <span className="relative z-10 flex size-7 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel)] font-mono text-[9px] font-black text-[var(--accent)]">
                          {String(stepIndex + 1).padStart(2, "0")}
                        </span>

                        <span className="min-w-0 truncate text-xs font-bold text-[var(--text-strong)]">
                          {step.name}
                        </span>

                        <time className="flex shrink-0 items-center gap-1 font-mono text-[10px] font-black text-[var(--accent)]">
                          <CalendarDays className="size-3 text-[var(--faint)]" />
                          {step.date
                            ? step.date.slice(5).replace("-", "/")
                            : "--/--"}
                        </time>

                        <SelectionStatusBadge
                          result={step.result}
                          size="s"
                        />

                        <ChevronDown className="size-3 text-[var(--faint)] transition-transform duration-200 group-open/step:rotate-180" />
                      </summary>

                      <div className="ml-10 border-x border-b border-[var(--line)] bg-[var(--panel)] px-3 py-3">
                        <p className="font-mono text-[8px] font-bold tracking-[0.14em] text-[var(--faint)]">
                          DETAIL MEMO
                        </p>
                        <p className="mt-1.5 text-[10px] leading-5 text-[var(--muted)]">
                          {step.memo || "メモはありません"}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
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
