import { Building2 } from 'lucide-react';
import type { BasicInfo } from '@/api/generated/models/basicInfo';
import { RecordTableWidget } from '@/features/companies/ui/detail/RecordTableWidget';

type BasicInfoWidgetProps = {
  onRemove: () => void;
  records: BasicInfo[];
  onSave: (title: string, text: string, id?: number) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
};

export function BasicInfoWidget({
  onRemove,
  records,
  onSave,
  onDelete,
}: BasicInfoWidgetProps) {
  return (
    <RecordTableWidget
      title="基本情報"
      code="BASIC_INFO"
      icon={Building2}
      records={records}
      onSave={onSave}
      onDelete={onDelete}
      dialogTitle="基本情報を追加"
      labelName="項目名"
      valueName="内容"
      onRemove={onRemove}
    />
  );
}
