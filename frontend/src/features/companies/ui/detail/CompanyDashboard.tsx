import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCompanyDetail } from "@/features/companies/hooks/useCompanyDetail";
import {
  type WidgetType,
  widgetLabels,
  widgetOrder,
} from "@/features/companies/model/companyDetail";
import { BasicInfoWidget } from "@/features/companies/ui/detail/BasicInfoWidget";
import { CompanyHeader } from "@/features/companies/ui/detail/CompanyHeader";
import { DocumentsWidget } from "@/features/companies/ui/detail/DocumentsWidget";
import { LinksWidget } from "@/features/companies/ui/detail/LinksWidget";
import { RelatedEventsWidget } from "@/features/companies/ui/detail/RelatedEventsWidget";
import { RelatedTasksWidget } from "@/features/companies/ui/detail/RelatedTasksWidget";
import { SelectionWidget } from "@/features/companies/ui/detail/SelectionWidget";
import { WidgetPicker } from "@/features/companies/ui/detail/WidgetPicker";
import { CancelButton, DeleteTextButton } from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";

const allWidgets: WidgetType[] = widgetOrder;

export function CompanyDashboard() {
  const company = useCompanyDetail();
  const [pendingRemoval, setPendingRemoval] = useState<WidgetType | null>(null);

  const hiddenWidgets = useMemo(
    () => allWidgets.filter(
      (widget) => !company.widgets.includes(widget),
    ),
    [company.widgets],
  );

  function renderWidget(widget: WidgetType) {
    const requestRemoval = () => setPendingRemoval(widget);

    switch (widget) {
      case "basic-info":
        return <BasicInfoWidget key={widget} onRemove={requestRemoval} />;
      case "links":
        return <LinksWidget key={widget} onRemove={requestRemoval} />;
      case "tasks":
        return <RelatedTasksWidget key={widget} />;
      case "events":
        return <RelatedEventsWidget key={widget} />;
      case "documents":
        return (
          <DocumentsWidget
            key={widget}
            documents={company.documents}
          />
        );
      case "selection":
        return <SelectionWidget key={widget} />;
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

      <div className="mt-4 flex justify-end">
        <WidgetPicker
          hiddenWidgets={hiddenWidgets}
          onAdd={company.addWidget}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {company.widgets.map(renderWidget)}
      </div>

      {pendingRemoval && (
        <DeleteDialog
          title="コンポーネントを削除しますか？"
          text={`「${widgetLabels[pendingRemoval]}」をこの画面から削除します。`}
          onCancel={() => setPendingRemoval(null)}
          onDelete={confirmRemoval}
          onBackdropClick={() => setPendingRemoval(null)}
        />
      )}
    </div>
  );
}
