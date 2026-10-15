import { useCallback, useMemo, useState } from 'react';
import { authenticatedRequest } from '@/api/authenticatedRequest';
import * as api from '@/api/generated/api';
import type {
  CreateCompanyRequest,
  CompanyPriority,
  SelectionStatus,
} from '@/api/generated/models';
import { requireStatus, useApiResource } from '@/api/useApiResource';

export function useCompanyList() {
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await authenticatedRequest(api.getCompanies, { signal });
    if (response.status !== 200)
      throw new Error('企業一覧を取得できませんでした。');
    return response.data.companies;
  }, []);
  const resource = useApiResource(loader);
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState('');
  const companies = useMemo(() => resource.data ?? [], [resource.data]);
  const visibleCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(query.toLowerCase()),
  );
  async function addCompany(request: CreateCompanyRequest) {
    const response = await authenticatedRequest((options) =>
      api.createCompany(request, options),
    );
    if (response.status !== 201)
      throw new Error(
        response.status === 409
          ? '同じ名前の企業が既に登録されています。'
          : '企業を追加できませんでした。',
      );
    await resource.refresh();
  }
  async function updateSelectionResult(
    companyId: number,
    status: SelectionStatus,
  ) {
    setActionError('');
    try {
      // Company list does not contain the selection ID required by the status API.
      const detail = await authenticatedRequest((options) =>
        api.getCompanyById(companyId, options),
      );
      if (detail.status !== 200)
        throw new Error('選考を取得できませんでした。');
      const selection = detail.data.selections?.find(
        (item) => item.id === detail.data.activeSelectionId,
      );
      if (!selection || selection.currentStepId === undefined)
        throw new Error('進行中の選考ステップがありません。');
      const stepId = selection.currentStepId;
      requireStatus(
        await authenticatedRequest((options) =>
          api.putSelectionStepStatus(
            companyId,
            selection.id,
            stepId,
            { status },
            options,
          ),
        ),
      );
      await resource.refresh();
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : '選考状況を保存できませんでした。',
      );
    }
  }
  async function reorderCompanies(
    orderedIds: number[],
    changes: Array<{ companyId: number; priority: CompanyPriority }>,
  ) {
    const priorityById = new Map(
      changes.map((change) => [change.companyId, change.priority]),
    );
    const byId = new Map(
      companies.map((company) => [
        company.id,
        {
          ...company,
          priority: priorityById.get(company.id) ?? company.priority,
        },
      ]),
    );
    // Preserve filtered-out items and place the reordered visible items in their old slots.
    const visibleIds = new Set(orderedIds);
    let index = 0;
    const order = companies.map((company) =>
      visibleIds.has(company.id) ? orderedIds[index++] : company.id,
    );
    const reordered = order.flatMap((id) => {
      const company = byId.get(id);
      return company ? [company] : [];
    });
    try {
      for (let i = reordered.length - 1; i >= 0; i--) {
        const company = reordered[i];
        const nextCompanyId =
          reordered
            .slice(i + 1)
            .find((item) => item.priority === company.priority)?.id ?? null;
        const previous = companies.find((item) => item.id === company.id);
        const oldIndex = companies.findIndex((item) => item.id === company.id);
        const oldNext =
          companies
            .slice(oldIndex + 1)
            .find((item) => item.priority === previous?.priority)?.id ?? null;
        if (
          previous?.priority === company.priority &&
          oldNext === nextCompanyId
        )
          continue;
        requireStatus(
          await authenticatedRequest((options) =>
            api.patchCompanyPriority(
              company.id,
              { priority: company.priority, nextCompanyId },
              options,
            ),
          ),
        );
      }
    } finally {
      await resource.refresh();
    }
  }
  return {
    isLoading: resource.isLoading,
    error: resource.error || actionError,
    allCompanies: companies,
    companies: visibleCompanies,
    query,
    setQuery,
    addCompany,
    updateSelectionResult,
    reorderCompanies,
  };
}
