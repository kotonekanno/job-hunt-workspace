import { authenticatedRequest } from '@/api/authenticatedRequest';
import type { Dispatch, SetStateAction } from 'react';
import * as api from '@/api/generated/api';
import type {
  GetCompanyResponse,
  CreateSelectionRequest,
  CreateSelectionStepRequest,
  UpdateSelectionStepRequest,
  SelectionStatus,
} from '@/api/generated/models';

export function useCompanySelections(
  companyId: number,
  setData: Dispatch<SetStateAction<GetCompanyResponse | undefined>>,
) {
  async function refresh() {
    const response = await authenticatedRequest((options) =>
      api.getCompanyById(companyId, options),
    );
    if (response.status !== 200)
      throw new Error('選考情報を取得できませんでした。');
    setData(
      (current) =>
        current && {
          ...current,
          selections: response.data.selections,
          activeSelectionId: response.data.activeSelectionId,
        },
    );
  }
  async function mutate(
    operation: () => Promise<{ status: number }>,
    expected = 204,
  ) {
    const response = await operation();
    if (response.status !== expected)
      throw new Error('選考情報を保存できませんでした。');
    await refresh();
  }
  return {
    create: (request: CreateSelectionRequest) =>
      mutate(
        () =>
          authenticatedRequest((options) =>
            api.createSelection(companyId, request, options),
          ),
        201,
      ),
    rename: (id: number, title: string) =>
      mutate(() =>
        authenticatedRequest((options) =>
          api.patchSelection(companyId, id, { title }, options),
        ),
      ),
    remove: (id: number) =>
      mutate(() =>
        authenticatedRequest((options) =>
          api.deleteSelection(companyId, id, options),
        ),
      ),
    setActive: (id: number, isActive: boolean) =>
      mutate(() =>
        authenticatedRequest((options) =>
          api.putSelectionIsActive(companyId, id, { isActive }, options),
        ),
      ),
    createStep: (id: number, request: CreateSelectionStepRequest) =>
      mutate(
        () =>
          authenticatedRequest((options) =>
            api.createSelectionStep(companyId, id, request, options),
          ),
        201,
      ),
    updateStep: (
      id: number,
      stepId: number,
      request: UpdateSelectionStepRequest,
    ) =>
      mutate(() =>
        authenticatedRequest((options) =>
          api.patchSelectionStep(companyId, id, stepId, request, options),
        ),
      ),
    removeStep: (id: number, stepId: number) =>
      mutate(() =>
        authenticatedRequest((options) =>
          api.deleteSelectionStep(companyId, id, stepId, options),
        ),
      ),
    reorderStep: (
      id: number,
      stepId: number,
      nextSelectionStepId: number | null,
    ) =>
      mutate(() =>
        authenticatedRequest((options) =>
          api.reorderSelectionStep(
            companyId,
            id,
            stepId,
            {
              nextSelectionStepId,
            },
            options,
          ),
        ),
      ),
    updateStatus: (id: number, stepId: number, status: SelectionStatus) =>
      mutate(() =>
        authenticatedRequest((options) =>
          api.putSelectionStepStatus(
            companyId,
            id,
            stepId,
            { status },
            options,
          ),
        ),
      ),
  };
}
export type CompanySelectionActions = ReturnType<typeof useCompanySelections>;
