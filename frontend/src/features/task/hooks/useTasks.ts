import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '@/api/generated/models/task';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { TaskForm } from '@/features/task/model/task';
import {
  deleteCompletedTaskRequest,
  deleteTaskRequest,
  loadTaskCompanies,
  loadTasks,
  saveTaskRequest,
  toggleTaskRequest,
} from '@/features/task/lib/taskApi';
import { toast } from '@/shared/toast';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [companyQuery, setCompanyQuery] = useState('');
  const ready = useRef(false);
  const busy = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    mounted.current = true;
    ready.current = false;
    void Promise.all([
      loadTasks(controller.signal),
      loadTaskCompanies(controller.signal),
    ])
      .then(([loadedTasks, loadedCompanies]) => {
        if (controller.signal.aborted) return;
        setTasks(loadedTasks);
        setCompanies(loadedCompanies);
        ready.current = true;
      })
      .catch(() => {
        if (!controller.signal.aborted)
          toast.error(
            'タスク・企業一覧を取得できませんでした。画面を再読み込みしてください。',
          );
      });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, []);

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
          (left, right) =>
            Number(left.done) - Number(right.done) ||
            (left.deadline ?? '\uffff').localeCompare(
              right.deadline ?? '\uffff',
            ),
        ),
    [tasks, companyQuery],
  );

  async function mutate(action: () => Promise<void>) {
    if (busy.current) return false;
    if (!ready.current) {
      toast.error(
        '一覧の読み込みが完了していません。読み込みに失敗した場合は画面を再読み込みしてください。',
      );
      return false;
    }
    busy.current = true;
    try {
      await action();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.startsWith('企業を')
          ? error.message
          : 'タスクの更新に失敗しました。もう一度お試しください。',
      );
      busy.current = false;
      return false;
    }
    try {
      const updated = await loadTasks();
      if (mounted.current) setTasks(updated);
    } catch {
      ready.current = false;
      toast.error(
        '更新は完了しましたが、一覧の再取得に失敗しました。画面を再読み込みしてください。',
      );
    } finally {
      busy.current = false;
    }
    return true;
  }

  return {
    tasks: visibleTasks,
    companyOptions: [...new Set(companies.map((company) => company.name))],
    companyQuery,
    completedCount: tasks.filter((task) => task.done).length,
    setCompanyQuery,
    toggleTask: (id: number) => {
      const task = tasks.find((item) => item.id === id);
      if (task) void mutate(() => toggleTaskRequest(task));
    },
    saveTask: (form: TaskForm) =>
      mutate(() =>
        saveTaskRequest(
          form,
          companies,
          tasks.find((task) => task.id === form.id),
        ),
      ),
    deleteTask: (id: number) => {
      void mutate(() => deleteTaskRequest(id));
    },
    deleteCompletedTasks: () => {
      void mutate(() => deleteCompletedTaskRequest(tasks));
    },
  };
}
