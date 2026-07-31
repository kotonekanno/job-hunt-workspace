import {
  ChevronDown,
  GitBranch,
} from "lucide-react";
import { useState } from "react";
import {
  initialSelectionTracks,
  type SelectionResult,
  type SelectionTrack,
} from "@/features/companies/model/companyDetail";
import { SelectionStepItem } from "@/features/companies/ui/detail/SelectionStepItem";
import { SelectionTrackDialog } from "@/features/companies/ui/detail/SelectionTrackDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import {
  AddButton,
  DeleteIconButton,
  EditIconButton,
} from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";

type SelectionWidgetProps = {
  onRemove: () => void;
};

export function SelectionWidget({
  onRemove,
}: SelectionWidgetProps) {
  const [tracks, setTracks] = useState(initialSelectionTracks);
  const [editingTrack, setEditingTrack] = useState<SelectionTrack>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<SelectionTrack>();

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
              step.id === stepId
                ? { ...step, result }
                : step),
          }
        : track));
  }

  function updateStepMemo(
    trackId: number,
    stepId: number,
    memo: string,
  ) {
    setTracks((current) => current.map((track) =>
      track.id === trackId
        ? {
            ...track,
            steps: track.steps.map((step) =>
              step.id === stepId
                ? { ...step, memo }
                : step),
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
        icon={GitBranch}
        action={addButton}
        onRemove={onRemove}
      >
        <div className="space-y-3">
          {tracks.map((track) => (
            <details
              key={track.id}
              className="group border border-[var(--line)] bg-[var(--panel-raised)] shadow-[0_3px_12px_var(--shadow)] transition-[border-color,box-shadow] open:border-[var(--line-strong)] hover:border-[var(--accent)] hover:shadow-[0_5px_16px_var(--shadow)]"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
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
                  transparent={false}
                  ariaLabel={`${track.name}を編集`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openEditDialog(track);
                  }}
                />

                <DeleteIconButton
                  size="s"
                  transparent={false}
                  ariaLabel={`${track.name}を削除`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setPendingTrack(track);
                  }}
                />

                <ChevronDown className="size-4 shrink-0 text-[var(--faint)] transition-transform duration-200 group-open:rotate-180" />
              </summary>

              <div className="border-t border-[var(--line)] bg-[var(--panel)] px-3 py-4">
                <div className="relative ml-3 space-y-2 border-l-2 border-[var(--accent-soft)] pl-5">
                  {track.steps.map((step, stepIndex) => (
                    <SelectionStepItem
                      key={step.id}
                      trackName={track.name}
                      step={step}
                      index={stepIndex}
                      onResultChange={(result) => {
                        updateStepResult(track.id, step.id, result);
                      }}
                      onMemoChange={(memo) => {
                        updateStepMemo(track.id, step.id, memo);
                      }}
                    />
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

      {pendingTrack && (
        <DeleteDialog
          title="選考を削除しますか？"
          text={`「${pendingTrack.name}」と含まれる選考ステップを削除します。この操作は取り消せません。`}
          onClose={() => setPendingTrack(undefined)}
          onConfirm={() => {
            removeTrack(pendingTrack.id);
            setPendingTrack(undefined);
          }}
        />
      )}
    </>
  );
}
