import { authenticatedRequest } from '@/api/authenticatedRequest';
import * as api from '@/api/generated/api';
import type { CreateCompanyRequest } from '@/api/generated/models';
import { useEffect, useMemo, useState } from 'react';
import {
  type CompanyListItem,
  type CompanyPriority,
} from '@/features/companies/model/companyList';
import type { SelectionStatus } from '@/features/companies/model/selection';

export function useCompanyList() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await authenticatedRequest(
          (options) => api.getCompanies(options),
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (response.status !== 200) throw new Error();
        setCompanies((current) => {
          const fetchedIds = new Set(
            response.data.companies.map((company) => company.id),
          );
          return [
            ...response.data.companies,
            ...current.filter((company) => !fetchedIds.has(company.id)),
          ];
        });
      } catch {
        if (!controller.signal.aborted)
          setError('企業一覧を取得できませんでした。');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  const [query, setQuery] = useState('');

  const visibleCompanies = useMemo(
    () =>
      companies.filter((company) =>
        company.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [companies, query],
  );

  async function addCompany(company: CreateCompanyRequest) {
    const response = await authenticatedRequest((options) =>
      api.createCompany(company, options),
    );
    if (response.status !== 201)
      throw new Error(
        response.status === 409
          ? '同じ名前の企業が既に登録されています。'
          : '企業を追加できませんでした。',
      );
    setCompanies((current) => [
      ...current,
      {
        ...company,
        id: response.data.companyId,
        currentSelection: null,
        latestActivity: null,
      },
    ]);
  }

  function updateSelectionResult(
    companyId: number,
    selectionResult: SelectionStatus,
  ) {
    setCompanies((current) =>
      current.map((company) =>
        company.id === companyId && company.currentSelection
          ? {
              ...company,
              currentSelection: {
                ...company.currentSelection,
                step: {
                  ...company.currentSelection.step,
                  status:
                    selectionResult === 'not_started'
                      ? 'NOT_STARTED'
                      : selectionResult === 'pending'
                        ? 'PENDING'
                        : selectionResult === 'passed'
                          ? 'PASSED'
                          : 'FAILED',
                },
              },
            }
          : company,
      ),
    );
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
        priorityChanges.map(({ companyId, priority }) => [companyId, priority]),
      );
      const updatedCompanies = current.map((company) => ({
        ...company,
        priority: priorityByCompanyId.get(company.id) ?? company.priority,
      }));
      const orderedIdSet = new Set(orderedIds);
      const orderByCompanyId = new Map<number, number>();

      for (const priority of [1, 2, 3, 4, 5, 6, 7]) {
        const orderedIdsInPriority = orderedIds.filter((id) =>
          updatedCompanies.some(
            (company) => company.id === id && company.priority === priority,
          ),
        );
        const remainingIds = updatedCompanies
          .filter(
            (company) =>
              company.priority === priority && !orderedIdSet.has(company.id),
          )
          .map((company) => company.id);

        [...orderedIdsInPriority, ...remainingIds].forEach((id, index) => {
          orderByCompanyId.set(id, index + 1);
        });
      }

      return updatedCompanies.sort(
        (left, right) =>
          (orderByCompanyId.get(left.id) ?? 0) -
          (orderByCompanyId.get(right.id) ?? 0),
      );
    });
  }

  return {
    isLoading,
    error,
    allCompanies: companies,
    companies: visibleCompanies,
    query,
    setQuery,
    addCompany,
    updateSelectionResult,
    reorderCompanies,
  };
}
