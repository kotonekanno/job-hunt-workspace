import { useState } from "react";
import {
  initialDocuments,
  widgetOrder,
  type CompanyDocument,
  type WidgetType,
} from "@/features/companies/model/companyDetail";

export function useCompanyDetail() {
  const [widgets, setWidgets] = useState<WidgetType[]>([
    "basic-info",
    "links",
    "documents",
    "selection",
    "tasks",
    "events",
  ]);
  const [documents, setDocuments] = useState<CompanyDocument[]>(initialDocuments);

  function addWidget(widget: WidgetType) {
    setWidgets((current) => {
      if (current.includes(widget)) {
        return current;
      }

      return [...current, widget].sort(
        (left, right) => widgetOrder.indexOf(left) - widgetOrder.indexOf(right),
      );
    });
  }

  function removeWidget(widget: WidgetType) {
    setWidgets((current) => current.filter((item) => item !== widget));
  }

  function saveDocument(document: CompanyDocument) {
    setDocuments((current) => current.map((item) =>
      item.id === document.id ? document : item));
  }

  return {
    widgets,
    documents,
    addWidget,
    removeWidget,
    saveDocument,
  };
}
