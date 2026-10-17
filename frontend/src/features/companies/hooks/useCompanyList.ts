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
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [query, setQuery] = useState('');
  const ready = useRef(false);
  const busy = useRef(false);
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
        if (!controller.signal.aborted)
          toast.error(
            '企業一覧を取得できませんでした。画面を再読み込みしてください。',
          );
      });
    return () => {
      mounted.current = false;
      ready.current = false;
      controller.abort();
    };
  }, []);
  const visibleCompanies = useMemo(
    () =>
      companies.filter((company) =>
        company.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      ),
    [companies, query],
  );

  async function mutate(
    action: () => Promise<void>,
    reloadOnFailure = false,
    reloadOnSuccess = true,
  ) {
    if (busy.current) return false;
    if (!ready.current) {
      toast.error('企業一覧を再読み込みしてから操作してください。');
      return false;
    }
    busy.current = true;
    let success = false;
    try {
      await action();
      success = true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '操作に失敗しました。',
      );
    }
    if ((success && reloadOnSuccess) || (!success && reloadOnFailure)) {
      try {
        const items = await loadCompanies();
        if (mounted.current) setCompanies(items);
      } catch {
        ready.current = false;
        toast.error(
          '一覧を再取得できませんでした。画面を再読み込みして操作結果を確認してください。',
        );
      }
    }
    busy.current = false;
    return success;
  }
  return {
    companies: visibleCompanies,
    query,
    setQuery,
    addCompany: (request: CreateCompanyRequest) =>
      mutate(() => addCompanyRequest(request)),
    updateSelectionResult: (companyId: number, status: SelectionStatus) => {
      const company = companies.find((item) => item.id === companyId);
      if (!company || company.priority === 7 || !company.currentSelection)
        return;
      const previous = company.currentSelection;
      void mutate(
        async () => {
          setCompanies((items) =>
            items.map((item) =>
              item.id === companyId
                ? {
                    ...item,
                    currentSelection: {
                      ...previous,
                      step: { ...previous.step, status },
                    },
                  }
                : item,
            ),
          );
          try {
            await changeCompanyStatus(company, status);
          } catch (error) {
            if (mounted.current)
              setCompanies((items) =>
                items.map((item) =>
                  item.id === companyId
                    ? { ...item, currentSelection: previous }
                    : item,
                ),
              );
            throw error;
          }
        },
        false,
        false,
      );
    },
    reorderCompanies: (visible: CompanyListItem[]) =>
      mutate(
        () =>
          persistCompanyOrder(
            companies,
            mergeVisibleCompanyOrder(companies, visible),
          ),
        true,
      ),
  };
}
