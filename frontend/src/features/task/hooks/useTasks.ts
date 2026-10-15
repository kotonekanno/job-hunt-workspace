import { useCallback, useMemo, useState } from 'react';
import { authenticatedRequest } from '@/api/authenticatedRequest';
import * as api from '@/api/generated/api';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/api/generated/models';
import { requireStatus, useApiResource } from '@/api/useApiResource';

export function useTasks(companyId?: number) {
  const loader = useCallback(
    async (signal: AbortSignal) => {
      if (companyId !== undefined) {
        const detail = await authenticatedRequest(
          (options) => api.getCompanyById(companyId, options),
          { signal },
        );
        if (detail.status !== 200)
          throw new Error('関連タスクを取得できませんでした。');
        return detail.data.tasks;
      }
      const response = await authenticatedRequest(api.getTasks, { signal });
      if (response.status !== 200)
        throw new Error('タスクを取得できませんでした。');
      return response.data.tasks;
    },
    [companyId],
  );
  const resource = useApiResource(loader);
  const [companyQuery, setCompanyQuery] = useState('');
  const [actionError, setActionError] = useState('');
  const tasks = useMemo(() => resource.data ?? [], [resource.data]);
  const visibleTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            !companyQuery ||
            task.companyName
              ?.toLowerCase()
              .includes(companyQuery.toLowerCase()),
        )
        .sort(
          (a, b) =>
            Number(a.done) - Number(b.done) ||
            (a.deadline ?? '\uffff').localeCompare(b.deadline ?? '\uffff'),
        ),
    [tasks, companyQuery],
  );
  async function saveTask(request: CreateTaskRequest, id?: number) {
    requireStatus(
      id === undefined
        ? await authenticatedRequest((options) =>
            api.createTask(request, options),
          )
        : await authenticatedRequest((options) =>
            api.patchTask(id, request, options),
          ),
      id === undefined ? 201 : 204,
    );
    await resource.refresh();
  }
  async function updateTask(id: number, patch: UpdateTaskRequest) {
    requireStatus(
      await authenticatedRequest((options) =>
        api.patchTask(id, patch, options),
      ),
    );
    await resource.refresh();
  }
  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setActionError('');
    try {
      await updateTask(id, { done: !task.done });
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : '更新できませんでした。',
      );
    }
  }
  async function deleteTask(id: number) {
    requireStatus(
      await authenticatedRequest((options) => api.deleteTask(id, options)),
    );
    await resource.refresh();
  }
  async function deleteCompletedTasks() {
    const taskIds = tasks.filter((task) => task.done).map((task) => task.id);
    if (!taskIds.length) return;
    requireStatus(
      await authenticatedRequest((options) =>
        api.bulkDeleteTasks({ taskIds }, options),
      ),
    );
    await resource.refresh();
  }
  return {
    tasks: visibleTasks,
    companyQuery,
    completedCount: tasks.filter((task) => task.done).length,
    isLoading: resource.isLoading,
    error: resource.error || actionError,
    setCompanyQuery,
    toggleTask,
    saveTask,
    deleteTask,
    deleteCompletedTasks,
  };
}
