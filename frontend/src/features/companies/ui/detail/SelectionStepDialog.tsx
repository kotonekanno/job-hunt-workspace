import { useRef, useState } from 'react';
import type { SelectionStep } from '@/features/companies/model/selection';
import { SelectionStepFields } from '@/features/companies/ui/detail/SelectionStepFields';
import { EditDialog } from '@/shared/dialog';

export function SelectionStepDialog({
  step,
  onSave,
  onClose,
}: {
  step?: SelectionStep;
  onSave: (step: SelectionStep) => Promise<boolean>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SelectionStep>(
    () =>
      step ?? {
        id: Date.now() + Math.random(),
        stepNo: 1,
        title: '',
        note: '',
        heldAt: '',
        status: 'not_started',
      },
  );
  const saving = useRef(false);
  return (
    <EditDialog
      title={step ? '選考ステップを編集' : '選考ステップを追加'}
      submitText={step ? '保存する' : '追加する'}
      onClose={onClose}
      onSubmit={async (event) => {
        event.preventDefault();
        if (!draft.title.trim() || saving.current) return;
        saving.current = true;
        try {
          if (await onSave({ ...draft, title: draft.title.trim() })) onClose();
        } finally {
          saving.current = false;
        }
      }}
    >
      <SelectionStepFields
        title={draft.title}
        note={draft.note}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      />
    </EditDialog>
  );
}
