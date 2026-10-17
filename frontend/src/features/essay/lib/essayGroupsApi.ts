import {
  createEssay,
  createEssayGroup,
  deleteEssayGroup,
  getCompanies,
  getEssayGroups,
  patchEssayGroup,
  reorderEssayGroup,
} from '@/api/generated/api';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import type { CreateEssayRequest } from '@/api/generated/models/createEssayRequest';
import type { CreateEssayGroupRequest } from '@/api/generated/models/createEssayGroupRequest';
import type { UpdateEssayGroupRequest } from '@/api/generated/models/updateEssayGroupRequest';
import type { ReorderEssayGroupBody } from '@/api/generated/models/reorderEssayGroupBody';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import { getAccessToken } from '@/features/auth/model/accessToken';

// Company selection and group selection are input state, not API response models.
export type EssayForm = Pick<CreateEssayRequest, 'question' | 'answer'> & {
  company?: string;
  groupId: string;
};
export function groupPathId(id: EssayGroupListItem['id']) {
  return id === null ? 'unclassified' : String(id);
}

function options(signal?: AbortSignal): RequestInit {
  const token = getAccessToken();
  return {
    signal,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
function expectStatus(status: number, expected: number) {
  if (status === expected) return;
  throw new Error(
    status === 409
      ? '同じ名前のジャンルが既に登録されています。'
      : '保存・削除に失敗しました。もう一度お試しください。',
  );
}
export async function loadEssayGroups(signal?: AbortSignal) {
  const response = await getEssayGroups(options(signal));
  if (response.status !== 200)
    throw new Error('ジャンル一覧を取得できませんでした。');
  // Preserve server order within managed groups; unclassified stays last in the UI.
  return [
    ...response.data.essayGroups.filter((group) => group.id !== null),
    ...response.data.essayGroups.filter((group) => group.id === null),
  ];
}
export async function loadEssayCompanies(signal?: AbortSignal) {
  const response = await getCompanies(options(signal));
  if (response.status !== 200)
    throw new Error('企業一覧を取得できませんでした。');
  return response.data.companies;
}
export async function addEssayGroupRequest(name: string) {
  const request: CreateEssayGroupRequest = { name };
  expectStatus((await createEssayGroup(request, options())).status, 201);
}
export async function updateEssayGroupRequest(id: number, name: string) {
  const request: UpdateEssayGroupRequest = { name };
  expectStatus(
    (await patchEssayGroup(String(id), request, options())).status,
    204,
  );
}
export async function deleteEssayGroupRequest(id: number) {
  expectStatus((await deleteEssayGroup(String(id), options())).status, 204);
}
export async function addEssayRequest(
  form: EssayForm,
  groups: EssayGroupListItem[],
  companies: CompanyListItem[],
) {
  if (
    form.groupId !== 'unclassified' &&
    !groups.some((group) => groupPathId(group.id) === form.groupId)
  )
    throw new Error('追加先のジャンルを選び直してください。');
  let companyId: number | null = null;
  if (form.company) {
    const matches = companies.filter(
      (company) => company.name === form.company,
    );
    if (matches.length !== 1)
      throw new Error(
        '企業を一意に特定できません。企業の選択を確認してください。',
      );
    companyId = matches[0].id;
  }
  const request: CreateEssayRequest = {
    companyId,
    question: form.question,
    answer: form.answer,
  };
  expectStatus(
    (await createEssay(form.groupId, request, options())).status,
    201,
  );
}
export async function saveEssayGroupOrder(
  previous: EssayGroupListItem[],
  desired: number[],
) {
  const current = previous.flatMap((group) =>
    group.id === null ? [] : [group.id],
  );
  if (
    current.length !== desired.length ||
    new Set(desired).size !== desired.length ||
    desired.some((id) => !current.includes(id))
  )
    throw new Error(
      'ジャンル一覧が変更されました。並べ替えを開き直してください。',
    );
  for (let index = desired.length - 1; index >= 0; index -= 1) {
    const id = desired[index];
    const nextEssayGroupId = desired[index + 1] ?? null;
    const oldIndex = current.indexOf(id);
    if ((current[oldIndex + 1] ?? null) === nextEssayGroupId) continue;
    const request: ReorderEssayGroupBody = { nextEssayGroupId };
    expectStatus(
      (await reorderEssayGroup(String(id), request, options())).status,
      204,
    );
    current.splice(oldIndex, 1);
    current.splice(
      nextEssayGroupId === null
        ? current.length
        : current.indexOf(nextEssayGroupId),
      0,
      id,
    );
  }
}
