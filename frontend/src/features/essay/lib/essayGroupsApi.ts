import type { UpdateEssayRequest } from '@/api/generated/models/updateEssayRequest';
import {
  createEssay,
  getEssaysByGroupId,
  patchEssay,
  deleteEssay,
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
  const response = await getCompanies(undefined, options(signal));
  if (response.status !== 200)
    throw new Error('企業一覧を取得できませんでした。');
  return response.data.companies;
}
export async function addEssayGroupRequest(name: string) {
  const request: CreateEssayGroupRequest = { name };
  const response = await createEssayGroup(request, options());
  if (response.status !== 201) {
    expectStatus(response.status, 201);
    throw new Error('ジャンルを追加できませんでした。');
  }
  return response.data.essayGroupId;
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
  const response = await createEssay(form.groupId, request, options());
  if (response.status !== 201) {
    expectStatus(response.status, 201);
    throw new Error('ESを追加できませんでした。');
  }
  return response.data.essayId;
}
export async function saveEssayGroupOrder(
  previous: EssayGroupListItem[],
  desired: number[],
  onProgress?: (ids: number[]) => void,
  movedIds?: number[],
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
    if (movedIds && !movedIds.includes(id)) continue;
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
    onProgress?.([...current]);
  }
}

export class EssayLoadError extends Error {
  constructor(public status: number) {
    super('文章一覧を取得できませんでした。');
  }
}
export async function loadGroupEssays(groupId: string, signal?: AbortSignal) {
  const response = await getEssaysByGroupId(groupId, options(signal));
  if (response.status !== 200) throw new EssayLoadError(response.status);
  return response.data.essays;
}
export async function updateEssayRequest(
  groupId: string,
  id: number,
  request: UpdateEssayRequest,
) {
  expectStatus((await patchEssay(groupId, id, request, options())).status, 204);
}
export async function deleteEssayRequest(groupId: string, id: number) {
  expectStatus((await deleteEssay(groupId, id, options())).status, 204);
}

export async function moveEssayRequest(
  groupId: string,
  essayId: number,
  nextGroupId: string,
  groups: EssayGroupListItem[],
) {
  if (nextGroupId === 'unclassified') {
    return updateEssayRequest(groupId, essayId, { essayGroupId: null });
  }
  const group = groups.find((item) => groupPathId(item.id) === nextGroupId);
  if (!group || group.id === null)
    throw new Error('移動先のジャンルを選び直してください。');
  return updateEssayRequest(groupId, essayId, { essayGroupId: group.id });
}

export function adjustGroupCount(
  groups: EssayGroupListItem[],
  groupId: string,
  delta: number,
) {
  const exists = groups.some((group) => groupPathId(group.id) === groupId);
  const next = groups.map((group) =>
    groupPathId(group.id) === groupId
      ? { ...group, quantity: Math.max(0, group.quantity + delta) }
      : group,
  );
  return !exists && groupId === 'unclassified' && delta > 0
    ? [...next, { id: null, name: '未分類', quantity: delta }]
    : next;
}
