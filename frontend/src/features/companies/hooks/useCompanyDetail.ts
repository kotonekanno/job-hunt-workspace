import { useState } from 'react';
import {
  initialDocument,
  widgetOrder,
  type CompanyDocument,
  type WidgetType,
} from '@/features/companies/model/companyDetail';

export function useCompanyDetail() {
  const [widgets, setWidgets] = useState<WidgetType[]>(widgetOrder);
  const [document, saveDocument] = useState<CompanyDocument>(initialDocument);

  function addWidget(widget: WidgetType) {
    setWidgets((current) =>
      widgetOrder.filter((item) => item === widget || current.includes(item)),
    );
  }

  function removeWidget(widget: WidgetType) {
    if (widget !== 'basic-info' && widget !== 'selection') return;
    setWidgets((current) => current.filter((item) => item !== widget));
  }

  return { widgets, document, addWidget, removeWidget, saveDocument };
}
