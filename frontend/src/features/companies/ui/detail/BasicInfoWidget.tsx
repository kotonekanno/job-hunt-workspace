import { Building2 } from "lucide-react";
import { companyProfile } from "@/features/companies/model/companyDetail";
import { RecordTableWidget } from "@/features/companies/ui/detail/RecordTableWidget";

type BasicInfoWidgetProps = {
  onRemove: () => void;
};

export function BasicInfoWidget({
  onRemove,
}: BasicInfoWidgetProps) {
  return (
    <RecordTableWidget
      title="基本情報"
      code="BASIC_INFO"
      icon={Building2}
      initialRecords={companyProfile.basicInfo}
      dialogTitle="基本情報を追加"
      labelName="項目名"
      valueName="内容"
      onRemove={onRemove}
    />
  );
}
