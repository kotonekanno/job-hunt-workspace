import type { Activity } from '@/api/generated/models/activity';
import { MessageSquareText } from 'lucide-react';
import { CompanyActivityHistory } from '@/features/companies/ui/list/CompanyActivityHistory';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';

export function ActivitiesWidget({
  companyId,
  initialActivities,
}: {
  companyId: number;
  initialActivities: Activity[];
}) {
  return (
    <WidgetFrame
      title="やりとり履歴"
      code="ACTIVITIES"
      icon={MessageSquareText}
      className="flex h-[600px] min-w-0 flex-col lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:h-auto lg:min-h-[520px]"
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      <CompanyActivityHistory
        companyId={companyId}
        initialPage={initialActivities}
        editable
      />
    </WidgetFrame>
  );
}
