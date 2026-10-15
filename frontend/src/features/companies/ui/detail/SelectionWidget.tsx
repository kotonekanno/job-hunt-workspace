import { ChevronDown, GitBranch } from 'lucide-react';
import { useState } from 'react';
import type {
  Selection,
  SelectionStepResponse,
  UpdateSelectionStepRequest,
} from '@/api/generated/models';
import type { CompanySelectionActions } from '@/features/companies/hooks/useCompanySelections';
import { SelectionStepItem } from '@/features/companies/ui/detail/SelectionStepItem';
import { SelectionTrackDialog } from '@/features/companies/ui/detail/SelectionTrackDialog';
import { SelectionManageDialog } from '@/features/companies/ui/detail/SelectionManageDialog';
import { SelectionStepDialog } from '@/features/companies/ui/detail/SelectionStepDialog';
import { SelectionProgressMenu } from '@/features/companies/ui/detail/SelectionProgressMenu';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { AddButton } from '@/shared/button';
import { EditDeleteMenu } from '@/shared/EditDeleteMenu';
import { DeleteDialog, EditDialog } from '@/shared/dialog';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

export function SelectionWidget({
  tracks,
  activeSelectionId,
  actions,
  onRemove,
}: {
  tracks: Selection[];
  activeSelectionId?: number | null;
  actions: CompanySelectionActions;
  onRemove: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number>();
  const editingTrack = tracks.find((track) => track.id === editingId);
  const [editingStep, setEditingStep] = useState<{
    trackId: number;
    step: SelectionStepResponse;
  }>();
  const [deletingStep, setDeletingStep] = useState<{
    trackId: number;
    step: SelectionStepResponse;
  }>();
  const [deletingTrack, setDeletingTrack] = useState<Selection>();
  const [pendingActive, setPendingActive] = useState<Selection>();
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState<number[]>(
    activeSelectionId == null ? [] : [activeSelectionId],
  );
  async function run(operation: () => Promise<void>) {
    setError('');
    try {
      await operation();
    } catch {
      setError('選考情報を保存できませんでした。');
    }
  }
  return (
    <>
      <WidgetFrame
        title="選考状況"
        code="SELECTION_PROCESS"
        icon={GitBranch}
        onRemove={onRemove}
        action={
          <AddButton
            text="選考を追加"
            size="s"
            onClick={() => setIsCreating(true)}
          />
        }
      >
        {error && (
          <p role="alert" className="text-sm text-rose-500">
            {error}
          </p>
        )}
        <div className="space-y-3">
          {!tracks.length && (
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
                    : current.filter((id) => id !== track.id),
                );
              }}
              className="group border border-[var(--line)] bg-[var(--panel-raised)] shadow-[0_3px_12px_var(--shadow)] open:border-[var(--line-strong)] hover:border-[var(--accent)]"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
                <SelectionProgressMenu
                  title={track.title}
                  isActive={track.id === activeSelectionId}
                  onChange={() => {
                    if (
                      track.id !== activeSelectionId &&
                      activeSelectionId != null
                    )
                      setPendingActive(track);
                    else
                      void run(() =>
                        actions.setActive(
                          track.id,
                          track.id !== activeSelectionId,
                        ),
                      );
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-black text-[var(--text-strong)]">
                    {track.title}
                  </h3>
                  {track.id === activeSelectionId && (
                    <p className="mt-0.5 font-mono text-[9px] font-semibold tracking-widest text-[var(--accent)]">
                      IN PROGRESS
                    </p>
                  )}
                </div>
                <span className="ml-auto shrink-0 font-mono text-xs text-[var(--muted)]">
                  {track.steps.length} STEPS
                </span>
                <EditDeleteMenu
                  label={track.title}
                  onEdit={() => setEditingId(track.id)}
                  onDelete={() => setDeletingTrack(track)}
                />
                <ChevronDown className="size-4 text-[var(--faint)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-[var(--line)] bg-[var(--panel)] px-3 py-4">
                <div className="relative ml-3 space-y-2 border-l-2 border-[var(--accent-soft)] pl-5">
                  {track.steps.map((step, index) => (
                    <SelectionStepItem
                      key={step.id}
                      trackName={track.title}
                      step={step}
                      index={index}
                      isCurrent={track.currentStepId === step.id}
                      onEdit={() => setEditingStep({ trackId: track.id, step })}
                      onDelete={() =>
                        setDeletingStep({ trackId: track.id, step })
                      }
                      onResultChange={(result) => {
                        void run(() =>
                          actions.updateStatus(track.id, step.id, result),
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </WidgetFrame>
      {isCreating && (
        <SelectionTrackDialog
          onClose={() => setIsCreating(false)}
          onSave={actions.create}
        />
      )}
      {editingTrack && (
        <SelectionManageDialog
          track={editingTrack}
          actions={actions}
          onClose={() => setEditingId(undefined)}
        />
      )}
      {editingStep && (
        <SelectionStepDialog
          step={editingStep.step}
          onClose={() => setEditingStep(undefined)}
          onSave={async (request) => {
            const patch: UpdateSelectionStepRequest = {};
            if (request.name !== editingStep.step.name)
              patch.name = request.name;
            if (request.note !== editingStep.step.note)
              patch.note = request.note;
            if (Object.keys(patch).length)
              await actions.updateStep(
                editingStep.trackId,
                editingStep.step.id,
                patch,
              );
          }}
        />
      )}
      {deletingStep && (
        <DeleteDialog
          title="選考ステップを削除しますか？"
          text="この選考ステップとメモを削除します。"
          onClose={() => setDeletingStep(undefined)}
          onConfirm={() => {
            void run(async () => {
              await actions.removeStep(
                deletingStep.trackId,
                deletingStep.step.id,
              );
              setDeletingStep(undefined);
            });
          }}
        />
      )}
      {deletingTrack && (
        <DeleteDialog
          title="選考を削除しますか？"
          text={`「${deletingTrack.title}」と含まれる選考ステップを削除します。`}
          onClose={() => setDeletingTrack(undefined)}
          onConfirm={() => {
            void run(async () => {
              await actions.remove(deletingTrack.id);
              setDeletingTrack(undefined);
            });
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
            void run(async () => {
              await actions.setActive(pendingActive.id, true);
              setPendingActive(undefined);
            });
          }}
        >
          <p className="text-sm text-[var(--text)]">
            進行中の選考を「{pendingActive.title}」に変更します。
          </p>
        </EditDialog>
      )}
    </>
  );
}
