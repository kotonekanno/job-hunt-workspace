import { useOptimisticState, temporaryId } from '@/shared/useOptimisticState';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { CreateCompanyRequest } from '@/api/generated/models/createCompanyRequest';
import type { SelectionStatus } from '@/api/generated/models/selectionStatus';
import {
  addCompanyRequest,
  changeCompanyStatus,
  loadCompanies,
  persistCompanyOrder,
} from '@/features/companies/lib/companyListApi';
import { mergeVisibleCompanyOrder } from '@/features/companies/lib/companyBoard';
import { toast } from '@/shared/toast';

export function useCompanyList() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const state = useOptimisticState<CompanyListItem[]>([]);
  const { value: companies, setValue: setCompanies } = state;
  const [query, setQuery] = useState('');
  const ready = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    mounted.current = true;
    void loadCompanies(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return;
        setCompanies(items);
        ready.current = true;
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
        if (!controller.signal.aborted)
          toast.error(
            '企業一覧を取得できませんでした。画面を再読み込みしてください。',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      mounted.current = false;
      ready.current = false;
      controller.abort();
    };
  }, [setCompanies]);
  const visibleCompanies = useMemo(
    () =>
      companies.filter((company) =>
        company.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      ),
    [companies, query],
  );

  return {
    loading,
    loadError,
    companies: visibleCompanies,
    query,
    setQuery,
    addCompany: (request: CreateCompanyRequest) => {
      if (!ready.current) return Promise.resolve(false);
      const id = temporaryId();
      return state.mutate(
        (items) => [
          ...items,
          { ...request, id, currentSelection: null, latestActivity: null },
        ],
        () => addCompanyRequest(request),
        (items, savedId) =>
          items.map((item) =>
            item.id === id ? { ...item, id: savedId } : item,
          ),
      );
    },
    updateSelectionResult: (companyId: number, status: SelectionStatus) => {
      const company = companies.find((item) => item.id === companyId);
      if (
        !ready.current ||
        !company ||
        company.priority === 7 ||
        !company.currentSelection ||
        companyId < 0
      )
        return;
      void state.mutate(
        (items) =>
          items.map((item) =>
            item.id === companyId && item.currentSelection
              ? {
                  ...item,
                  currentSelection: {
                    ...item.currentSelection,
                    step: { ...item.currentSelection.step, status },
                  },
                }
              : item,
          ),
        () => changeCompanyStatus(company, status),
      );
    },
    reorderCompanies: (visible: CompanyListItem[], movedId: number) => {
      if (!ready.current) return Promise.resolve(false);
      const next = mergeVisibleCompanyOrder(companies, visible, movedId);
      let confirmed = companies;
      return state.mutate(
        () => next,
        () =>
          persistCompanyOrder(
            companies,
            next,
            (saved) => {
              confirmed = saved;
            },
            movedId,
          ),
        undefined,
        () => confirmed,
      );
    },
  };
}
