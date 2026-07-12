import { useState } from "react";
import { companyProfile } from "@/features/companies/model/companyDetail";
import { RecordDialog } from "@/features/companies/ui/detail/RecordDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import { OutlineAddButton } from "@/shared/button";

type BasicInfoWidgetProps = {
  onRemove: () => void;
};

export function BasicInfoWidget({ onRemove }: BasicInfoWidgetProps) {
  const [records, setRecords] = useState(companyProfile.basicInfo);
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
        title="基本情報"
        code="BASIC_INFO"
        onRemove={onRemove}
        action={addButton}
      >
        <dl className="divide-y divide-[var(--line)] text-sm">
          {records.map(([label, value]) => (
            <div key={`${label}-${value}`} className="grid gap-1 py-3 sm:grid-cols-[120px_1fr]">
              <dt className="text-xs text-[var(--faint)]">{label}</dt>
              <dd className="font-medium text-[var(--text-strong)]">{value}</dd>
            </div>
          ))}
        </dl>
      </WidgetFrame>

      {isDialogOpen && (
        <RecordDialog
          title="基本情報を追加"
          labelName="項目名"
          valueName="内容"
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
