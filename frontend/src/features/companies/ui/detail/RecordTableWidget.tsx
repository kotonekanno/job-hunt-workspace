import { useState, type ReactNode } from "react";
import { RecordDialog } from "@/features/companies/ui/detail/RecordDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import {
  DeleteIconButton,
  EditIconButton,
  OutlineAddButton,
} from "@/shared/button";

type RecordTableRowProps = {
  label: string;
  value: string;
  renderValue: (value: string) => ReactNode;
  onEdit: () => void;
};

type RecordTableWidgetProps = {
  title: string;
  code: string;
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
}: RecordTableRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-2 py-3 h-12">
      <div className="grid min-w-0 gap-1 sm:grid-cols-[120px_minmax(0,1fr)]">
        <dt className="text-xs text-[var(--faint)]">
          {label}
        </dt>
        <dd className="min-w-0 font-medium text-[var(--text-strong)]">
          {renderValue(value)}
        </dd>
      </div>

      <EditIconButton
        onClick={onEdit}
        ariaLabel={`${label}を編集`}
      />
    </div>
  );
}

export function RecordTableWidget({
  title,
  code,
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

  const addButton = (
    <OutlineAddButton
      text="レコードを追加"
      onClick={() => setIsDialogOpen(true)}
    />
  );

  return (
    <>
      <WidgetFrame
        title={title}
        code={code}
        onRemove={onRemove}
        action={addButton}
      >
        <dl className="divide-y divide-[var(--line)] text-sm">
          {records.map(([label, value]) => (
            <RecordTableRow
              key={`${label}-${value}`}
              label={label}
              value={value}
              renderValue={renderValue}
              onEdit={() => {}}
            />
          ))}
        </dl>
      </WidgetFrame>

      {isDialogOpen && (
        <RecordDialog
          title={dialogTitle}
          labelName={labelName}
          valueName={valueName}
          valueType={valueType}
          onClose={() => setIsDialogOpen(false)}
          onSave={(label, value) => setRecords((current) => [
            ...current,
            [label, value],
          ])}
        />
      )}
    </>
  );
}
