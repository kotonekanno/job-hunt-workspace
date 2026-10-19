import type { BasicInfo } from '@/api/generated/models/basicInfo';
import type { LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { InlineRecordRow } from '@/features/companies/ui/detail/InlineRecordRow';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { OutlineAddButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

type RecordTableWidgetProps = {
  title: string;
  code: string;
  icon: LucideIcon;
  records: BasicInfo[];
  onSave: (title: string, text: string, id?: number) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  dialogTitle: string;
  labelName: string;
  valueName: string;
  onRemove: () => void;
  valueType?: 'text' | 'url';
  renderValue?: (value: string) => ReactNode;
};

type RecordItem = { id: string; label: string; value: string; isNew?: boolean };

export function RecordTableWidget({
  title,
  code,
  icon,
  records: savedRecords,
  onSave,
  onDelete,
  labelName,
  valueName,
  onRemove,
  renderValue,
}: RecordTableWidgetProps) {
  const [drafts, setDrafts] = useState<RecordItem[]>([]);
  const records: RecordItem[] = [
    ...savedRecords.map((record) => ({
      id: String(record.id),
      label: record.title,
      value: record.text,
    })),
    ...drafts,
  ];
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingRecord = records.find((record) => record.id === deletingId);

  function removeRecord(id: string) {
    setDrafts((current) => current.filter((record) => record.id !== id));
  }

  return (
    <>
      <WidgetFrame
        title={title}
        code={code}
        icon={icon}
        onRemove={onRemove}
        action={
          <OutlineAddButton
            text="レコードを追加"
            onClick={() =>
              setDrafts((current) => [
                ...current,
                { id: crypto.randomUUID(), label: '', value: '', isNew: true },
              ])
            }
          />
        }
      >
        {records.length === 0 ? (
          <WidgetEmptyState text="基本情報のレコードを追加しましょう" />
        ) : (
          <table
            aria-label={title}
            className="w-full table-fixed border-collapse"
          >
            <colgroup>
              <col className="w-[30%]" />
              <col />
              <col className="w-[72px]" />
            </colgroup>
            <tbody>
              {records.map((record) => (
                <InlineRecordRow
                  key={record.id}
                  label={record.label}
                  value={record.value}
                  isNew={record.isNew}
                  labelName={labelName}
                  valueName={valueName}
                  renderValue={renderValue}
                  onSave={async (label, value) => {
                    if (record.isNew) removeRecord(record.id);
                    const success = await onSave(
                      label,
                      value,
                      record.isNew ? undefined : Number(record.id),
                    );
                    if (!success && record.isNew)
                      setDrafts((items) => [
                        ...items,
                        { ...record, label, value },
                      ]);
                    return success;
                  }}
                  onCancelNew={() => removeRecord(record.id)}
                  onDelete={() => setDeletingId(record.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </WidgetFrame>
      {deletingRecord && (
        <DeleteDialog
          title="レコードを削除しますか？"
          text={`「${deletingRecord.label}」を削除します。この操作は取り消せません。`}
          onClose={() => setDeletingId(null)}
          onConfirm={async () => {
            if (
              deletingRecord.isNew ||
              (await onDelete(Number(deletingRecord.id)))
            ) {
              removeRecord(deletingRecord.id);
              setDeletingId(null);
            }
          }}
        />
      )}
    </>
  );
}
