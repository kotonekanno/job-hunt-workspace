import {
  bulkDeleteTasks,
  createTask,
  deleteTask,
  getCompanies,
  getTasks,
  patchTask,
} from '@/api/generated/api';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { CreateTaskRequest } from '@/api/generated/models/createTaskRequest';
import type { Task } from '@/api/generated/models/task';
import type { UpdateTaskRequest } from '@/api/generated/models/updateTaskRequest';
import { getAccessToken } from '@/features/auth/model/accessToken';
import type { TaskForm } from '@/features/task/model/task';

function options(signal?: AbortSignal): RequestInit {
  const token = getAccessToken();
  return {
    signal,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function expectStatus(actual: number, expected: number) {
  if (actual !== expected) throw new Error(`API request failed: ${actual}`);
}

export async function loadTasks(signal?: AbortSignal) {
  const response = await getTasks(options(signal));
  if (response.status !== 200)
    throw new Error('タスク一覧を取得できませんでした。');
  return response.data.tasks;
}

export async function loadTaskCompanies(signal?: AbortSignal) {
  const response = await getCompanies(options(signal));
  if (response.status !== 200)
    throw new Error('企業一覧を取得できませんでした。');
  return response.data.companies;
}

export function taskRequest(
  form: TaskForm,
  companies: CompanyListItem[],
  original?: Task,
): CreateTaskRequest | UpdateTaskRequest {
  const fields: CreateTaskRequest = {
    title: form.title,
    note: form.note || null,
    deadline: form.deadline || null,
  };
  // The response has no companyId. Preserve an unchanged relationship by omitting it.
  if (original && form.companyName === original.companyName) return fields;
  if (!form.companyName) return { ...fields, companyId: null };
  const matches = companies.filter(
    (company) => company.name === form.companyName,
  );
  if (matches.length !== 1)
    throw new Error(
      '企業を一意に特定できません。企業の選択を確認してください。',
    );
  return { ...fields, companyId: matches[0].id };
}

export async function saveTaskRequest(
  form: TaskForm,
  companies: CompanyListItem[],
  original?: Task,
) {
  const request = taskRequest(form, companies, original);
  if (original) {
    expectStatus(
      (await patchTask(original.id, request, options())).status,
      204,
    );
  } else {
    const createRequest: CreateTaskRequest = {
      ...request,
      title: form.title,
      deadline: form.deadline || null,
    };
    expectStatus((await createTask(createRequest, options())).status, 201);
  }
}

export async function toggleTaskRequest(task: Task) {
  expectStatus(
    (await patchTask(task.id, { done: !task.done }, options())).status,
    204,
  );
}

export async function deleteTaskRequest(id: number) {
  expectStatus((await deleteTask(id, options())).status, 204);
}

export async function deleteCompletedTaskRequest(tasks: Task[]) {
  const taskIds = tasks.filter((task) => task.done).map((task) => task.id);
  if (taskIds.length)
    expectStatus((await bulkDeleteTasks({ taskIds }, options())).status, 204);
}
