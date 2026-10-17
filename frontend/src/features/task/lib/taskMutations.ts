import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { Task } from '@/api/generated/models/task';
import type { TaskForm } from '@/features/task/model/task';
import { temporaryId, useOptimisticState } from '@/shared/useOptimisticState';
import {
  taskRequest,
  saveTaskRequest,
  toggleTaskRequest,
  deleteTaskRequest,
  deleteCompletedTaskRequest,
} from './taskApi';

export function taskMutations(
  state: ReturnType<typeof useOptimisticState<Task[]>>,
  companies: CompanyListItem[],
  canWrite: () => boolean,
  companyId?: number,
) {
  const tasks = state.value;
  return {
    saveTask: (form: TaskForm) => {
      if (!canWrite()) return Promise.resolve(false);
      const original = tasks.find((item) => item.id === form.id);
      const id = original?.id ?? temporaryId();
      return state.mutate(
        (items) => {
          if (form.id !== undefined && !original)
            throw new Error('編集するタスクが見つかりません。');
          const request = taskRequest(form, companies, original);
          const next: Task = {
            id,
            title: form.title,
            note: form.note || null,
            deadline: form.deadline || null,
            companyName: form.companyName || undefined,
            done: original?.done ?? false,
          };
          const belongs =
            companyId === undefined ||
            request.companyId === undefined ||
            request.companyId === companyId;
          const updated = original
            ? items.map((item) => (item.id === id ? next : item))
            : [...items, next];
          return belongs ? updated : updated.filter((item) => item.id !== id);
        },
        () => saveTaskRequest(form, companies, original),
        (items, savedId) =>
          items.map((item) =>
            item.id === id ? { ...item, id: savedId } : item,
          ),
      );
    },
    toggleTask: (id: number) => {
      const task = tasks.find((item) => item.id === id);
      if (task && id > 0 && canWrite())
        void state.mutate(
          (items) =>
            items.map((item) =>
              item.id === id ? { ...item, done: !item.done } : item,
            ),
          () => toggleTaskRequest(task),
        );
    },
    deleteTask: (id: number) => {
      if (id > 0 && canWrite())
        void state.mutate(
          (items) => items.filter((item) => item.id !== id),
          () => deleteTaskRequest(id),
        );
    },
    deleteCompletedTasks: () => {
      if (canWrite())
        void state.mutate(
          (items) => items.filter((item) => !item.done),
          () => deleteCompletedTaskRequest(tasks),
        );
    },
  };
}
