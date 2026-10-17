import {
  createCompany,
  getCompanies,
  getCompanyActivity,
  getCompanyById,
  patchCompanyPriority,
  putSelectionStepStatus,
} from '@/api/generated/api';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { CreateCompanyRequest } from '@/api/generated/models/createCompanyRequest';
import type { UpdateCompanyPriorityRequest } from '@/api/generated/models/updateCompanyPriorityRequest';
import type { SelectionStatus } from '@/api/generated/models/selectionStatus';
import { getAccessToken } from '@/features/auth/model/accessToken';

function options(signal?: AbortSignal): RequestInit {
  const token = getAccessToken();
  return {
    signal,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
function expectStatus(status: number, expected: number) {
  if (status !== expected)
    throw new Error(
      status === 409
        ? '同じ企業が既に登録されています。'
        : '企業情報の取得・更新に失敗しました。',
    );
}
export async function loadCompanies(signal?: AbortSignal) {
  const response = await getCompanies(undefined, options(signal));
  if (response.status !== 200)
    throw new Error('企業一覧を取得できませんでした。');
  return response.data.companies;
}
export async function addCompanyRequest(request: CreateCompanyRequest) {
  expectStatus((await createCompany(request, options())).status, 201);
}
export async function loadCompanyActivities(
  companyId: number,
  page: number,
  signal?: AbortSignal,
) {
  const response = await getCompanyActivity(
    companyId,
    { page },
    options(signal),
  );
  // OpenAPI specifies 201, while the current GET implementation returns 200.
  // Keep the generated payload types and accept both successful statuses here.
  const status: number = response.status;
  if (status !== 200 && status !== 201)
    throw new Error('やりとり履歴を取得できませんでした。');
  return response.data && 'activities' in response.data
    ? (response.data.activities ?? [])
    : [];
}
export async function changeCompanyStatus(
  company: CompanyListItem,
  status: SelectionStatus,
) {
  if (company.priority === 7 || !company.currentSelection) return;
  const response = await getCompanyById(company.id, options());
  if (response.status !== 200)
    throw new Error('選考情報を取得できませんでした。');
  const stepId = company.currentSelection.step.id;
  const selection = response.data.selections?.find(
    (selection) =>
      selection.id === response.data.activeSelectionId &&
      selection.steps.some((step) => step.id === stepId),
  );
  if (!selection)
    throw new Error(
      '選考状況が変更されています。企業一覧を再読み込みしてください。',
    );
  expectStatus(
    (
      await putSelectionStepStatus(
        company.id,
        selection.id,
        stepId,
        { status },
        options(),
      )
    ).status,
    204,
  );
}

export async function persistCompanyOrder(
  previous: CompanyListItem[],
  desired: CompanyListItem[],
) {
  if (
    previous.length !== desired.length ||
    new Set(desired.map((item) => item.id)).size !== desired.length ||
    desired.some((item) => !previous.some((before) => before.id === item.id))
  )
    throw new Error('企業一覧が変更されています。再読み込みしてください。');
  const current = previous.map((item) => ({ ...item }));
  for (let index = desired.length - 1; index >= 0; index -= 1) {
    const company = desired[index];
    const nextCompanyId =
      desired
        .slice(index + 1)
        .find((item) => item.priority === company.priority)?.id ?? null;
    const oldIndex = current.findIndex((item) => item.id === company.id);
    const existing = current[oldIndex];
    const oldNext =
      current
        .slice(oldIndex + 1)
        .find((item) => item.priority === existing.priority)?.id ?? null;
    if (existing.priority === company.priority && oldNext === nextCompanyId)
      continue;
    const request: UpdateCompanyPriorityRequest = {
      priority: company.priority,
      nextCompanyId,
    };
    expectStatus(
      (await patchCompanyPriority(company.id, request, options())).status,
      204,
    );
    current.splice(oldIndex, 1);
    current.splice(
      nextCompanyId === null
        ? current.length
        : current.findIndex((item) => item.id === nextCompanyId),
      0,
      { ...company },
    );
  }
}
