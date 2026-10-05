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
  initialRecords: string[][];
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
  initialRecords,
  labelName,
  valueName,
  onRemove,
  renderValue,
}: RecordTableWidgetProps) {
  const [records, setRecords] = useState<RecordItem[]>(() =>
    initialRecords.map(([label = '', value = ''], index) => ({
      id: `record-${index}`,
      label,
      value,
    })),
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingRecord = records.find((record) => record.id === deletingId);

  function removeRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
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
              setRecords((current) => [
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
                  onSave={(label, value) =>
                    setRecords((current) =>
                      current.map((item) =>
                        item.id === record.id
                          ? { ...item, label, value, isNew: false }
                          : item,
                      ),
                    )
                  }
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
          onConfirm={() => {
            removeRecord(deletingRecord.id);
            setDeletingId(null);
          }}
        />
      )}
    </>
  );
}
