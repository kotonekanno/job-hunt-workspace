import { useMemo, useState } from 'react';
import { useCompanyDetail } from '@/features/companies/hooks/useCompanyDetail';
import {
  type WidgetType,
  widgetLabels,
  widgetOrder,
} from '@/features/companies/model/companyDetail';
import { BasicInfoWidget } from '@/features/companies/ui/detail/BasicInfoWidget';
import { CompanyHeader } from '@/features/companies/ui/detail/CompanyHeader';
import { DocumentsWidget } from '@/features/companies/ui/detail/DocumentsWidget';
import { ActivitiesWidget } from '@/features/companies/ui/detail/ActivitiesWidget';
import { RelatedEventsWidget } from '@/features/companies/ui/detail/RelatedEventsWidget';
import { RelatedTasksWidget } from '@/features/companies/ui/detail/RelatedTasksWidget';
import { SelectionWidget } from '@/features/companies/ui/detail/SelectionWidget';
import { WidgetPicker } from '@/features/companies/ui/detail/WidgetPicker';
import { BackLink } from '@/shared/BackLink';
import { DeleteDialog } from '@/shared/dialog';

const allWidgets: WidgetType[] = widgetOrder;

export function CompanyDashboard() {
  const company = useCompanyDetail();
  const [pendingRemoval, setPendingRemoval] = useState<WidgetType | null>(null);

  const hiddenWidgets = useMemo(
    () => allWidgets.filter((widget) => !company.widgets.includes(widget)),
    [company.widgets],
  );

  function renderWidget(widget: WidgetType) {
    const requestRemoval = () => setPendingRemoval(widget);

    switch (widget) {
      case 'basic-info':
        return (
          <div
            key={widget}
            className="min-w-0 lg:col-start-1 lg:row-start-2 [&>section]:h-full"
          >
            <BasicInfoWidget onRemove={requestRemoval} />
          </div>
        );
      case 'tasks':
        return <RelatedTasksWidget key={widget} />;
      case 'events':
        return <RelatedEventsWidget key={widget} />;
      case 'documents':
        return (
          <DocumentsWidget
            key={widget}
            document={company.document}
            onDocumentChange={company.saveDocument}
          />
        );
      case 'selection':
        return (
          <div
            key={widget}
            className="min-w-0 lg:col-start-1 lg:row-start-3 [&>section]:h-full"
          >
            <SelectionWidget onRemove={requestRemoval} />
          </div>
        );
      case 'activities':
        return <ActivitiesWidget key={widget} />;
    }
  }

  function confirmRemoval() {
    if (!pendingRemoval) {
      return;
    }

    company.removeWidget(pendingRemoval);
    setPendingRemoval(null);
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <CompanyHeader />

      <div className="mt-4">
        <BackLink to="/companies">企業一覧へ戻る</BackLink>
      </div>

      <WidgetPicker hiddenWidgets={hiddenWidgets} onAdd={company.addWidget} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {company.widgets.map(renderWidget)}
      </div>

      {pendingRemoval && (
        <DeleteDialog
          title="ウィジェットを削除しますか？"
          text={`「${widgetLabels[pendingRemoval]}」をこの画面から削除します。`}
          onClose={() => setPendingRemoval(null)}
          onConfirm={confirmRemoval}
        />
      )}
    </div>
  );
}
