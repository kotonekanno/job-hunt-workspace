import { Fragment, useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { Reorder } from 'motion/react';
import type {
  Selection,
  SelectionStep,
} from '@/features/companies/model/selection';
import { SelectionReorderRow } from '@/features/companies/ui/detail/SelectionReorderRow';
import { SelectionStepDialog } from '@/features/companies/ui/detail/SelectionStepDialog';
import { DeleteDialog, DialogBase, DialogHeader } from '@/shared/dialog';

export function SelectionManageDialog({
  track,
  onSave,
  onClose,
}: {
  track: Selection;
  onSave: (track: Selection) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const [addingAt, setAddingAt] = useState<number>();
  const [deleting, setDeleting] = useState<SelectionStep>();
  const [dragging, setDragging] = useState(false);
  const steps = [...track.steps].sort((a, b) => a.stepNo - b.stepNo);
  function saveSteps(next: SelectionStep[]) {
    onSave({
      ...track,
      steps: next.map((step, index) => ({ ...step, stepNo: index + 1 })),
    });
  }
  function addButton(index: number) {
    return (
      <button
        type="button"
        aria-label={`ステップ${index + 1}の位置に追加`}
        onClick={() => setAddingAt(index)}
        className="flex h-8 w-full cursor-pointer items-center justify-center text-[var(--faint)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      >
        <Plus className="size-4" />
      </button>
    );
  }
  // Suspend the parent modal while a child dialog is open so Escape closes only the child.
  if (addingAt !== undefined)
    return (
      <SelectionStepDialog
        onClose={() => setAddingAt(undefined)}
        onSave={(step) =>
          saveSteps([
            ...steps.slice(0, addingAt),
            step,
            ...steps.slice(addingAt),
          ])
        }
      />
    );
  if (deleting)
    return (
      <DeleteDialog
        title="選考ステップを削除しますか？"
        text={`「${deleting.title}」を削除します。この操作は取り消せません。`}
        onClose={() => setDeleting(undefined)}
        onConfirm={() => {
          saveSteps(steps.filter((step) => step.id !== deleting.id));
          setDeleting(undefined);
        }}
      />
    );
  return (
    <DialogBase onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ui-dialog-surface w-full max-w-xl border border-[var(--line-strong)] p-6"
      >
        <DialogHeader
          title="選考を編集"
          subTitle={track.title}
          titleId={titleId}
          onClose={onClose}
        />
        <p className="mt-3 text-xs text-[var(--muted)]">
          選考ステップを並べ替え・追加・削除します。
        </p>
        <Reorder.Group
          as="div"
          layoutScroll
          axis="y"
          values={steps.map((step) => step.id)}
          onReorder={(ids) =>
            saveSteps(ids.map((id) => steps.find((step) => step.id === id)!))
          }
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
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
              />
            </Fragment>
          ))}
          {addButton(steps.length)}
        </Reorder.Group>
      </div>
    </DialogBase>
  );
}
