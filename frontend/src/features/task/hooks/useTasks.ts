import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '@/api/generated/models/task';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import { loadTaskCompanies, loadTasks } from '@/features/task/lib/taskApi';
import { taskMutations } from '@/features/task/lib/taskMutations';
import { useOptimisticState } from '@/shared/useOptimisticState';
import { toast } from '@/shared/toast';

export function useTasks() {
  const state = useOptimisticState<Task[]>([]);
  const { value: tasks, setValue: setTasks } = state;
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [companyQuery, setCompanyQuery] = useState('');
  const [ready, setReady] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    mounted.current = true;
    void Promise.all([
      loadTasks(controller.signal),
      loadTaskCompanies(controller.signal),
    ])
      .then(([loadedTasks, loadedCompanies]) => {
        if (controller.signal.aborted) return;
        setTasks(loadedTasks);
        setCompanies(loadedCompanies);
        setReady(true);
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
  }, [setTasks]);

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

  return {
    tasks: visibleTasks,
    companyOptions: [...new Set(companies.map((company) => company.name))],
    companyQuery,
    completedCount: tasks.filter((task) => task.done).length,
    setCompanyQuery,
    ...taskMutations(state, companies, () => ready),
  };
}
