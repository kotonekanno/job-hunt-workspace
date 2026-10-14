import { useEffect, useMemo, useState } from 'react';
import * as api from '@/api/generated/api';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/api/generated/models';
import { authenticatedRequest } from '@/api/authenticatedRequest';

export function useTasks(
  initialTasks?: Task[],
  companyId?: number,
  companyName?: string,
) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks ?? []);
  const [companyQuery, setCompanyQuery] = useState('');
  const [isLoading, setIsLoading] = useState(!initialTasks);
  const [error, setError] = useState('');
  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
      return;
    }
    const controller = new AbortController();
    async function load() {
      try {
        const response = await authenticatedRequest(
          (options) => api.getTasks(options),
          { signal: controller.signal },
        );
        if (response.status !== 200)
          throw new Error('タスクを取得できませんでした。');
        if (!controller.signal.aborted) setTasks(response.data.tasks);
      } catch {
        if (!controller.signal.aborted)
          setError('タスクを取得できませんでした。');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [initialTasks]);
  async function mutate<T>(operation: () => Promise<T>) {
    setError('');
    try {
      return await operation();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'タスクを更新できませんでした。',
      );
      throw cause;
    }
  }
  async function saveTask(
    request: CreateTaskRequest,
    id?: number,
    selectedCompanyName?: string,
  ) {
    await mutate(async () => {
      if (id !== undefined) {
        const current = tasks.find((task) => task.id === id);
        const patch: UpdateTaskRequest = {};
        if (!current || current.title !== request.title)
          patch.title = request.title;
        if (!current || current.note !== (request.note ?? ''))
          patch.note = request.note ?? '';
        if (!current || current.deadline !== request.deadline)
          patch.deadline = request.deadline;
        // The form omits companyId when its existing association is unchanged.
        if (request.companyId !== undefined)
          patch.companyId = request.companyId;
        if (!Object.keys(patch).length) return;
        const response = await authenticatedRequest((options) =>
          api.patchTask(id, patch, options),
        );
        if (response.status !== 204)
          throw new Error('タスクを保存できませんでした。');
      } else {
        const response = await authenticatedRequest((options) =>
          api.createTask(
            { ...request, companyId: companyId ?? request.companyId },
            options,
          ),
        );
        if (response.status !== 201)
          throw new Error('タスクを追加できませんでした。');
        setTasks((current) => [
          {
            id: response.data.taskId,
            title: request.title,
            note: request.note ?? '',
            deadline: request.deadline,
            done: false,
            companyName: selectedCompanyName ?? companyName,
          },
          ...current,
        ]);
        return;
      }
      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                title: request.title,
                note: request.note ?? '',
                deadline: request.deadline,
                companyName:
                  request.companyId === undefined
                    ? task.companyName
                    : (selectedCompanyName ?? companyName),
              }
            : task,
        ),
      );
    });
  }
  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    try {
      await mutate(async () => {
        const response = await authenticatedRequest((options) =>
          api.patchTask(id, { done: !task.done }, options),
        );
        if (response.status !== 204)
          throw new Error('完了状態を更新できませんでした。');
        setTasks((current) =>
          current.map((item) =>
            item.id === id ? { ...item, done: !task.done } : item,
          ),
        );
      });
    } catch {
      /* The hook exposes the error to the page. */
    }
  }
  async function deleteTask(id: number) {
    await mutate(async () => {
      const response = await authenticatedRequest((options) =>
        api.deleteTask(id, options),
      );
      if (response.status !== 204)
        throw new Error('タスクを削除できませんでした。');
      setTasks((current) => current.filter((task) => task.id !== id));
    });
  }
  async function deleteCompletedTasks() {
    const taskIds = tasks.filter((task) => task.done).map((task) => task.id);
    if (!taskIds.length) return;
    await mutate(async () => {
      const response = await authenticatedRequest((options) =>
        api.bulkDeleteTasks({ taskIds }, options),
      );
      if (response.status !== 204)
        throw new Error('完了済みタスクを削除できませんでした。');
      const deleted = new Set(taskIds);
      setTasks((current) => current.filter((task) => !deleted.has(task.id)));
    });
  }
  const visibleTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            !companyQuery ||
            task.companyName
              ?.toLocaleLowerCase()
              .includes(companyQuery.toLocaleLowerCase()),
        )
        .sort(
          (left, right) =>
            Number(left.done) - Number(right.done) ||
            (left.deadline ?? '\uffff').localeCompare(
              right.deadline ?? '\uffff',
            ),
        ),
    [tasks, companyQuery],
  );
  return {
    tasks: visibleTasks,
    allTasks: tasks,
    isLoading,
    error,
    companyQuery,
    setCompanyQuery,
    completedCount: tasks.filter((task) => task.done).length,
    toggleTask,
    saveTask,
    deleteTask,
    deleteCompletedTasks,
  };
}
