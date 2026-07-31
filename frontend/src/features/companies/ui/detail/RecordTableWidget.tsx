import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { RecordDialog } from "@/features/companies/ui/detail/RecordDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import {
  DeleteIconButton,
  EditIconButton,
  OutlineAddButton,
} from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";

type RecordTableRowProps = {
  label: string;
  value: string;
  renderValue: (value: string) => ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

type RecordTableWidgetProps = {
  title: string;
  code: string;
  icon: LucideIcon;
  initialRecords: string[][];
  dialogTitle: string;
  labelName: string;
  valueName: string;
  onRemove: () => void;
  valueType?: "text" | "url";
  renderValue?: (value: string) => ReactNode;
};

function RecordTableRow({
  label,
  value,
  renderValue,
  onEdit,
  onDelete,
}: RecordTableRowProps) {
  return (
    <div className="grid h-12 grid-cols-[minmax(0,1fr)_32px_32px] items-center gap-2 py-3">
      <div className="grid min-w-0 gap-1 sm:grid-cols-[120px_minmax(0,1fr)]">
        <dt className="text-xs text-[var(--faint)]">
          {label}
        </dt>
        <dd className="min-w-0 font-medium text-[var(--text-strong)]">
          {renderValue(value)}
        </dd>
      </div>

      <EditIconButton
        size="m"
        transparent={true}
        onClick={onEdit}
        ariaLabel={`${label}を編集`}
      />

      <DeleteIconButton
        size="m"
        transparent={true}
        onClick={onDelete}
        ariaLabel={`${label}を削除`}
      />
    </div>
  );
}

export function RecordTableWidget({
  title,
  code,
  icon,
  initialRecords,
  dialogTitle,
  labelName,
  valueName,
  onRemove,
  valueType,
  renderValue = (value) => value,
}: RecordTableWidgetProps) {
  const [records, setRecords] = useState(initialRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecordIndex, setEditingRecordIndex] = useState<number | null>(
    null,
  );
  const [deletingRecordIndex, setDeletingRecordIndex] = useState<number | null>(
    null,
  );
  const editingRecord = editingRecordIndex === null
    ? undefined
    : records[editingRecordIndex];
  const deletingRecord = deletingRecordIndex === null
    ? undefined
    : records[deletingRecordIndex];

  function closeRecordDialog() {
    setIsDialogOpen(false);
    setEditingRecordIndex(null);
  }

  const addButton = (
    <OutlineAddButton
      text="レコードを追加"
      onClick={() => {
        setEditingRecordIndex(null);
        setIsDialogOpen(true);
      }}
    />
  );

  return (
    <>
      <WidgetFrame
        title={title}
        code={code}
        icon={icon}
        onRemove={onRemove}
        action={addButton}
      >
        <dl className="divide-y divide-[var(--line)] text-sm">
          {records.map(([label, value], index) => (
            <RecordTableRow
              key={`${label}-${value}-${index}`}
              label={label}
              value={value}
              renderValue={renderValue}
              onEdit={() => {
                setEditingRecordIndex(index);
                setIsDialogOpen(true);
              }}
              onDelete={() => setDeletingRecordIndex(index)}
            />
          ))}
        </dl>
      </WidgetFrame>

      {isDialogOpen && (
        <RecordDialog
          title={editingRecord
            ? dialogTitle.replace("追加", "編集")
            : dialogTitle}
          labelName={labelName}
          valueName={valueName}
          valueType={valueType}
          initialLabel={editingRecord?.[0]}
          initialValue={editingRecord?.[1]}
          submitText={editingRecord ? "保存する" : "追加する"}
          onClose={closeRecordDialog}
          onSave={(label, value) => setRecords((current) => {
            if (editingRecordIndex === null) {
              return [...current, [label, value]];
            }

            return current.map((record, index) => (
              index === editingRecordIndex
                ? [label, value]
                : record
            ));
          })}
        />
      )}

      {deletingRecord && (
        <DeleteDialog
          title="レコードを削除しますか？"
          text={`「${deletingRecord[0]}」を削除します。この操作は取り消せません。`}
          onClose={() => setDeletingRecordIndex(null)}
          onConfirm={() => {
            setRecords((current) => current.filter(
              (_, index) => index !== deletingRecordIndex,
            ));
            setDeletingRecordIndex(null);
          }}
        />
      )}
    </>
  );
}
