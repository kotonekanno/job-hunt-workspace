import { SelectionManageDialog } from '@/features/companies/ui/detail/SelectionManageDialog';
import { SelectionStepDialog } from '@/features/companies/ui/detail/SelectionStepDialog';
import { ChevronDown, GitBranch } from 'lucide-react';
import { useState } from 'react';
import {
  type SelectionStatus,
  type Selection,
} from '@/features/companies/model/selection';
import { SelectionStepItem } from '@/features/companies/ui/detail/SelectionStepItem';
import { SelectionTrackDialog } from '@/features/companies/ui/detail/SelectionTrackDialog';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { AddButton } from '@/shared/button';
import { EditDeleteMenu } from '@/shared/EditDeleteMenu';
import { DeleteDialog, EditDialog } from '@/shared/dialog';
import { SelectionProgressMenu } from '@/features/companies/ui/detail/SelectionProgressMenu';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

type SelectionWidgetProps = {
  onRemove: () => void;
  tracks: Selection[];
  saveTrack: (track: Selection) => void;
  removeTrack: (id: number) => void;
  setActive: (id: number) => void;
  updateStepResult: (
    trackId: number,
    stepId: number,
    result: SelectionStatus,
  ) => void;
};

export function SelectionWidget({
  onRemove,
  tracks,
  saveTrack,
  removeTrack,
  setActive,
  updateStepResult,
}: SelectionWidgetProps) {
  const [editingTrackId, setEditingTrackId] = useState<number>();
  const editingTrack = tracks.find((track) => track.id === editingTrackId);
  const [editingStep, setEditingStep] = useState<{
    trackId: number;
    stepId: number;
  }>();
  const [deletingStep, setDeletingStep] = useState<{
    trackId: number;
    stepId: number;
  }>();
  const stepTrack = tracks.find((track) => track.id === editingStep?.trackId);
  const selectedStep = stepTrack?.steps.find(
    (step) => step.id === editingStep?.stepId,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<Selection>();
  const [pendingActive, setPendingActive] = useState<Selection>();
  const [expandedIds, setExpandedIds] = useState(() =>
    tracks.filter((track) => track.isActive).map((track) => track.id),
  );
  const activeTrack = tracks.find((track) => track.isActive);

  function openEditDialog(track: Selection) {
    setEditingTrackId(track.id);
  }

  const addButton = (
    <AddButton
      text="選考を追加"
      size="s"
      onClick={() => {
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
          {tracks.length === 0 && (
            <WidgetEmptyState text="選考を追加して、選考状況を記録しましょう" />
          )}
          {tracks.map((track) => (
            <details
              key={track.id}
              open={expandedIds.includes(track.id)}
              onToggle={(event) => {
                const open = event.currentTarget.open;
                setExpandedIds((current) =>
                  open
                    ? current.includes(track.id)
                      ? current
                      : [...current, track.id]
                    : current.includes(track.id)
                      ? current.filter((id) => id !== track.id)
                      : current,
                );
              }}
              className="group border border-[var(--line)] bg-[var(--panel-raised)] shadow-[0_3px_12px_var(--shadow)] transition-[border-color,box-shadow] open:border-[var(--line-strong)] hover:border-[var(--accent)] hover:shadow-[0_5px_16px_var(--shadow)]"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
                <SelectionProgressMenu
                  title={track.title}
                  isActive={track.isActive}
                  onChange={() => {
                    if (!track.isActive && activeTrack) setPendingActive(track);
                    else setActive(track.id);
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-black text-[var(--text-strong)]">
                    {track.title}
                  </h3>
                  {track.isActive && (
                    <p className="mt-0.5 font-mono text-[9px] font-semibold tracking-widest text-[var(--accent)]">
                      IN PROGRESS
                    </p>
                  )}
                </div>

                <span className="ml-auto shrink-0 font-mono text-xs font-semibold tracking-[0.08em] text-[var(--muted)]">
                  {track.steps.length} STEPS
                </span>
                <EditDeleteMenu
                  label={track.title}
                  onEdit={() => openEditDialog(track)}
                  onDelete={() => setPendingTrack(track)}
                />
                <ChevronDown className="size-4 shrink-0 text-[var(--faint)] transition-transform duration-200 group-open:rotate-180" />
              </summary>

              <div className="border-t border-[var(--line)] bg-[var(--panel)] px-3 py-4">
                <div className="relative ml-3 space-y-2 border-l-2 border-[var(--accent-soft)] pl-5">
                  {[...track.steps]
                    .sort((left, right) => left.stepNo - right.stepNo)
                    .map((step, stepIndex) => (
                      <SelectionStepItem
                        key={step.id}
                        trackName={track.title}
                        step={step}
                        index={stepIndex}
                        isCurrent={track.currentStep === step.id}
                        onEdit={() =>
                          setEditingStep({ trackId: track.id, stepId: step.id })
                        }
                        onDelete={() =>
                          setDeletingStep({
                            trackId: track.id,
                            stepId: step.id,
                          })
                        }
                        onResultChange={(result) => {
                          updateStepResult(track.id, step.id, result);
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
          onClose={() => setIsDialogOpen(false)}
          onSave={saveTrack}
        />
      )}

      {editingTrack && (
        <SelectionManageDialog
          track={editingTrack}
          onSave={saveTrack}
          onClose={() => setEditingTrackId(undefined)}
        />
      )}
      {selectedStep && stepTrack && (
        <SelectionStepDialog
          step={selectedStep}
          onClose={() => setEditingStep(undefined)}
          onSave={(updated) =>
            saveTrack({
              ...stepTrack,
              steps: stepTrack.steps.map((step) =>
                step.id === updated.id ? updated : step,
              ),
            })
          }
        />
      )}
      {deletingStep && (
        <DeleteDialog
          title="選考ステップを削除しますか？"
          text="この選考ステップとメモを削除します。この操作は取り消せません。"
          onClose={() => setDeletingStep(undefined)}
          onConfirm={() => {
            const track = tracks.find(
              (item) => item.id === deletingStep.trackId,
            );
            if (track)
              saveTrack({
                ...track,
                steps: [...track.steps]
                  .sort((a, b) => a.stepNo - b.stepNo)
                  .filter((step) => step.id !== deletingStep.stepId)
                  .map((step, index) => ({ ...step, stepNo: index + 1 })),
              });
            setDeletingStep(undefined);
          }}
        />
      )}
      {pendingActive && (
        <EditDialog
          title="進行中の選考を変更しますか？"
          submitText="変更する"
          onClose={() => setPendingActive(undefined)}
          onSubmit={(event) => {
            event.preventDefault();
            setActive(pendingActive.id);
            setPendingActive(undefined);
          }}
        >
          <p className="text-sm leading-6 text-[var(--text)]">
            進行中の選考を「{activeTrack?.title}」から「{pendingActive.title}
            」に変更します。「{activeTrack?.title}」は進行中の選考から外れます。
          </p>
        </EditDialog>
      )}

      {pendingTrack && (
        <DeleteDialog
          title="選考を削除しますか？"
          text={`「${pendingTrack.title}」と含まれる選考ステップを削除します。この操作は取り消せません。`}
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
