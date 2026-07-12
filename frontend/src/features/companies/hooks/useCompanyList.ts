import { useMemo, useState } from "react";
import {
  initialCompanyList,
  type CompanyListItem,
  type CompanyProgress,
} from "@/features/companies/model/companyList";
import type { CalendarEvent } from "@/features/calendar/model/calendar";

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

  return {
    allCompanies: companies,
    companies: visibleCompanies,
    query,
    progress,
    setQuery,
    setProgress,
    addCompany,
    updateNextEvent,
  };
}
