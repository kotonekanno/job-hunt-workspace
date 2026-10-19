import { normalizeSelection } from '@/features/companies/lib/selectionProgress';
import * as api from '@/api/generated/api';
import type { GetCompanyResponse } from '@/api/generated/models/getCompanyResponse';
import type { UpdateCompanyWidgetRequest } from '@/api/generated/models/updateCompanyWidgetRequest';
import type { CreateCompanyBasicInfoRequest } from '@/api/generated/models/createCompanyBasicInfoRequest';
import type { CreateCompanyActivityRequest } from '@/api/generated/models/createCompanyActivityRequest';
import type { UpdateCompanyActivityRequest } from '@/api/generated/models/updateCompanyActivityRequest';
import type { CompanyPriority } from '@/api/generated/models/companyPriority';
import type {
  Selection,
  SelectionStatus,
} from '@/features/companies/model/selection';
import { apiStatus, badgeStatus } from './companyBoard';
import { getAccessToken } from '@/features/auth/model/accessToken';

function options(signal?: AbortSignal): RequestInit {
  const token = getAccessToken();
  return {
    signal,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
function expect(status: number, expected = 204) {
  if (status !== expected)
    throw new Error('企業情報の取得・更新に失敗しました。');
}
export async function loadCompanyChoices(signal?: AbortSignal) {
  const response = await api.getCompaniesLookup(options(signal));
  if (response.status !== 200)
    throw new Error('企業一覧を取得できませんでした。');
  return response.data.companies;
}
export async function loadCompany(id: number, signal?: AbortSignal) {
  const response = await api.getCompanyById(id, options(signal));
  if (response.status !== 200)
    throw new Error(
      response.status === 404
        ? '企業が見つかりませんでした。'
        : '企業情報を取得できませんでした。',
    );
  return response.data;
}
export async function renameCompany(id: number, name: string) {
  expect((await api.patchCompany(id, { name }, options())).status);
}
export async function removeCompany(id: number) {
  expect((await api.deleteCompanyById(id, options())).status);
}
export async function saveCompanyPriority(
  id: number,
  priority: CompanyPriority,
) {
  expect(
    (
      await api.patchCompanyPriority(
        id,
        { priority, nextCompanyId: null },
        options(),
      )
    ).status,
  );
}
export async function saveCompanyDocument(id: number, document: string) {
  expect((await api.putCompanyDocument(id, { document }, options())).status);
}
export async function saveCompanyWidgets(
  id: number,
  request: UpdateCompanyWidgetRequest,
) {
  expect((await api.patchCompanyWidgets(id, request, options())).status);
}
export async function saveBasicInfo(
  id: number,
  request: CreateCompanyBasicInfoRequest,
  recordId?: number,
) {
  if (recordId === undefined) {
    const response = await api.createCompanyBasicInfo(id, request, options());
    if (response.status !== 201)
      throw new Error('基本情報を追加できませんでした。');
    return response.data.basicInfoId;
  }
  expect(
    (await api.patchCompanyBasicInfo(id, recordId, request, options())).status,
  );
  return recordId;
}
export async function removeBasicInfo(id: number, recordId: number) {
  expect((await api.deleteCompanyBasicInfo(id, recordId, options())).status);
}
export async function addActivity(
  id: number,
  request: CreateCompanyActivityRequest,
) {
  const response = await api.createCompanyActivity(id, request, options());
  if (response.status !== 201)
    throw new Error('やりとり履歴を追加できませんでした。');
  return response.data.activityId;
}
export async function updateActivity(
  id: number,
  activityId: number,
  request: UpdateCompanyActivityRequest,
) {
  expect(
    (await api.patchCompanyActivity(id, activityId, request, options())).status,
  );
}
export async function removeActivity(id: number, activityId: number) {
  expect((await api.deleteCompanyActivity(id, activityId, options())).status);
}
// UI/form representation includes derived order, active flags and draft IDs.
export function selectionViews(detail: GetCompanyResponse): Selection[] {
  return (detail.selections ?? []).map((selection) => ({
    id: selection.id,
    title: selection.title,
    isActive: selection.id === detail.activeSelectionId,
    currentStep: selection.currentStepId ?? 0,
    steps: selection.steps.map((step, index) => ({
      id: step.id,
      title: step.name,
      note: step.note ?? '',
      heldAt: '',
      stepNo: index + 1,
      status: badgeStatus[step.status],
    })),
  }));
}
export async function saveSelection(
  id: number,
  next: Selection,
  previous?: Selection,
  onProgress?: (saved: Selection) => void,
  movedId?: number,
) {
  if (!previous) {
    const response = await api.createSelection(
      id,
      {
        title: next.title,
        steps: next.steps.map((step) => ({
          name: step.title,
          note: step.note,
        })),
      },
      options(),
    );
    if (
      response.status !== 201 ||
      response.data.selectionStepIds.length !== next.steps.length
    )
      throw new Error('選考を追加できませんでした。');
    const steps = next.steps.map((step, index) => {
      const stepId = response.data.selectionStepIds[index];
      if (stepId === undefined)
        throw new Error('選考ステップのIDがありません。');
      return { ...step, id: stepId };
    });
    return {
      ...next,
      id: response.data.selectionId,
      steps,
      currentStep: steps[0]?.id ?? 0,
    };
  }
  const savedIds = new Map<number, number>();
  let confirmed = previous;
  function report() {
    confirmed = normalizeSelection(confirmed);
    onProgress?.(confirmed);
  }
  if (previous.title !== next.title) {
    expect(
      (await api.patchSelection(id, next.id, { title: next.title }, options()))
        .status,
    );
    confirmed = { ...confirmed, title: next.title };
    report();
  }
  const current = previous.steps.map((step) => step.id);
  for (const step of previous.steps) {
    if (!next.steps.some((item) => item.id === step.id)) {
      expect(
        (await api.deleteSelectionStep(id, next.id, step.id, options())).status,
      );
      current.splice(current.indexOf(step.id), 1);
      confirmed = {
        ...confirmed,
        steps: confirmed.steps
          .filter((item) => item.id !== step.id)
          .map((item, index) => ({ ...item, stepNo: index + 1 })),
      };
      report();
    }
  }
  let nextId: number | null = null;
  for (const step of [...next.steps].sort((a, b) => b.stepNo - a.stepNo)) {
    const old = previous.steps.find((item) => item.id === step.id);
    let stepId = step.id;
    if (!old) {
      const response = await api.createSelectionStep(
        id,
        next.id,
        { name: step.title, note: step.note, nextSelectionStepId: nextId },
        options(),
      );
      if (
        response.status !== 201 ||
        response.data.selectionStepId === undefined
      )
        throw new Error('選考ステップを追加できませんでした。');
      stepId = response.data.selectionStepId;
      savedIds.set(step.id, stepId);
      current.splice(
        nextId === null ? current.length : current.indexOf(nextId),
        0,
        stepId,
      );
      confirmed = {
        ...confirmed,
        steps: current.flatMap((id, index) => {
          const item =
            id === stepId
              ? { ...step, id: stepId }
              : confirmed.steps.find((item) => item.id === id);
          return item ? [{ ...item, stepNo: index + 1 }] : [];
        }),
      };
      report();
    } else {
      if (old.title !== step.title || old.note !== step.note) {
        expect(
          (
            await api.patchSelectionStep(
              id,
              next.id,
              stepId,
              { name: step.title, note: step.note },
              options(),
            )
          ).status,
        );
        confirmed = {
          ...confirmed,
          steps: confirmed.steps.map((item) =>
            item.id === stepId
              ? { ...item, title: step.title, note: step.note }
              : item,
          ),
        };
        report();
      }
      const index = current.indexOf(stepId);
      if (
        (movedId === undefined || stepId === movedId) &&
        (current[index + 1] ?? null) !== nextId
      ) {
        expect(
          (
            await api.reorderSelectionStep(
              id,
              next.id,
              stepId,
              { nextSelectionStepId: nextId },
              options(),
            )
          ).status,
        );
        current.splice(index, 1);
        current.splice(
          nextId === null ? current.length : current.indexOf(nextId),
          0,
          stepId,
        );
        confirmed = {
          ...confirmed,
          steps: current.flatMap((id, index) => {
            const item = confirmed.steps.find((item) => item.id === id);
            return item ? [{ ...item, stepNo: index + 1 }] : [];
          }),
        };
        report();
      }
    }
    nextId = stepId;
  }
  return {
    ...next,
    steps: next.steps.map((step) => ({
      ...step,
      id: savedIds.get(step.id) ?? step.id,
    })),
    currentStep: savedIds.get(next.currentStep) ?? next.currentStep,
  };
}
export async function removeSelection(id: number, selectionId: number) {
  expect((await api.deleteSelection(id, selectionId, options())).status);
}
export async function activateSelection(
  id: number,
  selectionId: number,
  isActive: boolean,
) {
  expect(
    (await api.putSelectionIsActive(id, selectionId, { isActive }, options()))
      .status,
  );
}
export async function saveSelectionStatus(
  id: number,
  selectionId: number,
  stepId: number,
  status: SelectionStatus,
) {
  expect(
    (
      await api.putSelectionStepStatus(
        id,
        selectionId,
        stepId,
        { status: apiStatus[status] },
        options(),
      )
    ).status,
  );
}
export async function loadCompanyEvents(
  companyId: number,
  signal?: AbortSignal,
) {
  const response = await api.getEvents({ companyId }, options(signal));
  if (response.status !== 200) throw new Error('予定を取得できませんでした。');
  return response.data.events;
}
