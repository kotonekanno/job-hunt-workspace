import { useMemo, useState } from "react";
import {
  initialCompanyList,
  type CompanyListItem,
  type CompanyPriority,
} from "@/features/companies/model/companyList";
import type { SelectionStatus } from "@/features/companies/model/selection";

export function useCompanyList() {
  const [companies, setCompanies] = useState(initialCompanyList);
  const [query, setQuery] = useState("");

  const visibleCompanies = useMemo(
    () => companies
      .filter((company) => company.name
        .toLowerCase()
        .includes(query.toLowerCase()))
      .sort((left, right) => left.order - right.order),
    [companies, query],
  );

  function addCompany(company: Omit<CompanyListItem, "id" | "order">) {
    setCompanies((current) => [
      ...current,
      {
        ...company,
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
        order: Math.max(
          0,
          ...current
            .filter((item) => item.priority === company.priority)
            .map((item) => item.order),
        ) + 1,
      },
    ]);
  }

  function updateSelectionResult(
    companyId: number,
    selectionResult: SelectionStatus,
  ) {
    setCompanies((current) => current.map((company) =>
      company.id === companyId
        ? {
            ...company,
            selection: {
              ...company.selection,
              status: selectionResult,
            },
          }
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
        priority: priorityByCompanyId.get(company.id) ?? company.priority,
      }));
      const orderedIdSet = new Set(orderedIds);
      const orderByCompanyId = new Map<number, number>();

      for (const priority of [0, 1, 2, 3, 4, 5, 6] as CompanyPriority[]) {
        const orderedIdsInPriority = orderedIds.filter((id) =>
          updatedCompanies.some((company) =>
            company.id === id && company.priority === priority));
        const remainingIds = updatedCompanies
          .filter((company) =>
            company.priority === priority && !orderedIdSet.has(company.id))
          .sort((left, right) => left.order - right.order)
          .map((company) => company.id);

        [...orderedIdsInPriority, ...remainingIds].forEach((id, index) => {
          orderByCompanyId.set(id, index + 1);
        });
      }

      return updatedCompanies.map((company) => ({
        ...company,
        order: orderByCompanyId.get(company.id) ?? company.order,
      }));
    });
  }

  return {
    allCompanies: companies,
    companies: visibleCompanies,
    query,
    setQuery,
    addCompany,
    updateSelectionResult,
    reorderCompanies,
  };
}
