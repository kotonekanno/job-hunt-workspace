import { Fragment, useId, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Reorder } from 'motion/react';
import type { Selection, SelectionStepResponse } from '@/api/generated/models';
import type { CompanySelectionActions } from '@/features/companies/hooks/useCompanySelections';
import { SelectionReorderRow } from '@/features/companies/ui/detail/SelectionReorderRow';
import { SelectionStepDialog } from '@/features/companies/ui/detail/SelectionStepDialog';
import { DeleteDialog, DialogBase, DialogHeader } from '@/shared/dialog';

export function SelectionManageDialog({
  track,
  actions,
  onClose,
}: {
  track: Selection;
  actions: CompanySelectionActions;
  onClose: () => void;
}) {
  const titleId = useId();
  const [draftTitle, setDraftTitle] = useState(track.title);
  const [addingBefore, setAddingBefore] = useState<number | null | undefined>();
  const [deleting, setDeleting] = useState<SelectionStepResponse>();
  const [order, setOrder] = useState<number[]>();
  const orderRef = useRef<number[] | undefined>(undefined);
  const draggingId = useRef<number | undefined>(undefined);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const steps = order
    ? order.flatMap((id) => track.steps.filter((step) => step.id === id))
    : track.steps;
  async function run(operation: () => Promise<void>) {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await operation();
    } catch {
      setError('選考情報を保存できませんでした。');
    } finally {
      setIsSaving(false);
    }
  }
  async function finishDrag() {
    setDragging(false);
    const ids = orderRef.current;
    const movedId = draggingId.current;
    draggingId.current = undefined;
    if (
      ids &&
      movedId !== undefined &&
      ids.some((id, index) => id !== track.steps[index]?.id)
    ) {
      const index = ids.indexOf(movedId);
      await run(() =>
        actions.reorderStep(track.id, movedId, ids[index + 1] ?? null),
      );
    }
    orderRef.current = undefined;
    setOrder(undefined);
  }
  function addButton(index: number) {
    return (
      <button
        type="button"
        disabled={isSaving}
        aria-label={`ステップ${index + 1}の位置に追加`}
        onClick={() => setAddingBefore(steps[index]?.id ?? null)}
        className="flex h-8 w-full cursor-pointer items-center justify-center text-[var(--faint)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      >
        <Plus className="size-4" />
      </button>
    );
  }
  return (
    <>
      <DialogBase
        onClose={onClose}
        suspended={addingBefore !== undefined || !!deleting}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="ui-dialog-surface max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[var(--line-strong)] p-6"
        >
          <DialogHeader
            title="選考を編集"
            subTitle={track.title}
            titleId={titleId}
            onClose={onClose}
          />
          {error && (
            <p role="alert" className="mt-3 text-sm text-rose-500">
              {error}
            </p>
          )}
          <form
            className="mt-4 flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (draftTitle.trim() && draftTitle.trim() !== track.title)
                void run(() => actions.rename(track.id, draftTitle.trim()));
            }}
          >
            <label className="min-w-0 flex-1 text-xs text-[var(--muted)]">
              選考タイトル
              <input
                required
                maxLength={50}
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                className="mt-1 h-10 w-full border border-[var(--line)] bg-[var(--panel-raised)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <button
              type="submit"
              disabled={
                isSaving ||
                !draftTitle.trim() ||
                draftTitle.trim() === track.title
              }
              className="h-10 cursor-pointer border border-[var(--accent)] bg-[var(--accent-soft)] px-4 text-xs font-bold text-[var(--accent)] disabled:opacity-40"
            >
              タイトルを保存
            </button>
          </form>
          <p className="mt-3 text-xs text-[var(--muted)]">
            選考ステップを並べ替え・追加・削除します。
          </p>
          <Reorder.Group
            as="div"
            axis="y"
            values={steps.map((step) => step.id)}
            onReorder={(ids) => {
              if (isSaving) return;
              orderRef.current = ids;
              setOrder(ids);
            }}
            data-drag-session={dragging}
            className="mt-3 max-h-[60vh] overflow-y-auto"
            style={{ position: 'relative' }}
          >
            {steps.map((step, index) => (
              <Fragment key={step.id}>
                {addButton(index)}
                <SelectionReorderRow
                  step={step}
                  index={index}
                  onDelete={() => setDeleting(step)}
                  onDragStart={() => {
                    draggingId.current = step.id;
                    setDragging(true);
                  }}
                  onDragEnd={() => {
                    void finishDrag();
                  }}
                />
              </Fragment>
            ))}
            {addButton(steps.length)}
          </Reorder.Group>
        </div>
      </DialogBase>
      {addingBefore !== undefined && (
        <SelectionStepDialog
          onClose={() => setAddingBefore(undefined)}
          onSave={(request) =>
            actions.createStep(track.id, {
              ...request,
              nextSelectionStepId: addingBefore,
            })
          }
        />
      )}
      {deleting && (
        <DeleteDialog
          title="選考ステップを削除しますか？"
          text={`「${deleting.name}」を削除します。`}
          onClose={() => setDeleting(undefined)}
          onConfirm={() => {
            void run(async () => {
              await actions.removeStep(track.id, deleting.id);
              setDeleting(undefined);
            });
          }}
        />
      )}
    </>
  );
}
