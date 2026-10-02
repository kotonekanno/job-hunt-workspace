import type { Selection } from '@/features/companies/model/selection';
import { EditDialog } from '@/shared/dialog';

const labels = {
  passed: '合格',
  not_started: '未受験',
  pending: '結果待ち',
  failed: '不合格',
};

export function SelectionProgressDialog({
  before,
  after,
  onClose,
  onConfirm,
}: {
  before: Selection;
  after: Selection;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const current = after.steps.find((step) => step.id === after.currentStep);
  return (
    <EditDialog
      title="現在のステップを変更しますか？"
      onClose={onClose}
      submitText="変更する"
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm();
      }}
    >
      <p className="text-sm leading-6 text-[var(--text)]">
        「{after.title}」の現在のステップを「{current?.title}
        」に変更します。前のステップはすべて合格、後のステップはすべて未受験になります。
      </p>
      <ul className="space-y-2 text-sm text-[var(--muted)]">
        {after.steps
          .filter(
            (step) =>
              before.steps.find((item) => item.id === step.id)?.status !==
              step.status,
          )
          .map((step) => (
            <li key={step.id}>
              {step.title}：
              {labels[before.steps.find((item) => item.id === step.id)!.status]}{' '}
              → {labels[step.status]}
            </li>
          ))}
      </ul>
    </EditDialog>
  );
}
