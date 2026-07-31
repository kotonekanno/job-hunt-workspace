import { useState } from "react";
import {
  initialDocuments,
  widgetOrder,
  type CompanyDocument,
  type WidgetType,
} from "@/features/companies/model/companyDetail";

export function useCompanyDetail() {
  const [widgets, setWidgets] = useState<WidgetType[]>([
    "documents",
    "basic-info",
    "links",
    "selection",
    "memo",
    "events",
    "tasks",
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

  function addDocument(title: string) {
    setDocuments((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((document) => document.id)) + 1,
        title,
        updatedAt: new Date().toISOString().slice(0, 10),
        content: "",
      },
    ]);
  }

  function deleteDocument(id: number) {
    setDocuments((current) => current.filter(
      (document) => document.id !== id,
    ));
  }

  function reorderDocuments(orderedIds: number[]) {
    setDocuments((current) => orderedIds
      .map((id) => current.find((document) => document.id === id))
      .filter((document): document is CompanyDocument => Boolean(document)));
  }

  return {
    widgets,
    documents,
    addWidget,
    removeWidget,
    saveDocument,
    addDocument,
    deleteDocument,
    reorderDocuments,
  };
}
