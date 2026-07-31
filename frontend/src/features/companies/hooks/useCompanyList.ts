import { useMemo, useState } from "react";
import {
  initialCompanyList,
  type CompanyListItem,
  type CompanyPriority,
  type CompanyProgress,
} from "@/features/companies/model/companyList";
import type { CalendarEvent } from "@/features/calendar/model/calendar";
import type { SelectionResult } from "@/features/companies/model/companyDetail";

export function useCompanyList() {
  const [companies, setCompanies] = useState(initialCompanyList);
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState<CompanyProgress | "すべて">("すべて");

  const visibleCompanies = useMemo(
    () => companies.filter((company) => {
      const matchesQuery = company.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesProgress = progress === "すべて"
        || company.progress === progress;

      return matchesQuery && matchesProgress;
    }),
    [companies, progress, query],
  );

  function addCompany(company: Omit<CompanyListItem, "id">) {
    setCompanies((current) => [
      ...current,
      {
        ...company,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
      },
    ]);
  }

  function updateNextEvent(
    companyId: number,
    event: CalendarEvent,
  ) {
    setCompanies((current) => current.map((company) =>
      company.id === companyId
        ? { ...company, nextEvent: event }
        : company));
  }

  function updatePriorityOptimistically(
    companyId: number,
    priority: CompanyPriority,
  ) {
    setCompanies((current) => current.map((company) =>
      company.id === companyId
        ? { ...company, priority }
        : company));
  }

  function updateSelectionResult(
    companyId: number,
    selectionResult: SelectionResult,
  ) {
    setCompanies((current) => current.map((company) =>
      company.id === companyId
        ? { ...company, selectionResult }
        : company));
  }

  function reorderCompanies(
    orderedIds: number[],
    priorityChanges: Array<{
      companyId: number;
      priority: CompanyPriority;
    }>,
  ) {
    setCompanies((current) => {
      const priorityByCompanyId = new Map(
        priorityChanges.map(({ companyId, priority }) => [
          companyId,
          priority,
        ]),
      );
      const updatedCompanies = current.map((company) => ({
        ...company,
        priority:
          priorityByCompanyId.get(company.id) ?? company.priority,
      }));
      const companyById = new Map(updatedCompanies.map(
        (company) => [company.id, company],
      ));
      const reorderedCompanies = orderedIds
        .map((id) => companyById.get(id))
        .filter((company): company is CompanyListItem => Boolean(company));
      const reorderedIdSet = new Set(orderedIds);
      let reorderedIndex = 0;

      return updatedCompanies.map((company) => {
        if (!reorderedIdSet.has(company.id)) {
          return company;
        }

        const reorderedCompany =
          reorderedCompanies[reorderedIndex] ?? company;
        reorderedIndex += 1;

        return reorderedCompany;
      });
    });
  }

  return {
    allCompanies: companies,
    companies: visibleCompanies,
    query,
    progress,
    setQuery,
    setProgress,
    addCompany,
    updateNextEvent,
    updatePriorityOptimistically,
    updateSelectionResult,
    reorderCompanies,
  };
}
