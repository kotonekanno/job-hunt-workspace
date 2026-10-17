import type { Task } from '@/api/generated/models/task';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import { useOptimisticState } from '@/shared/useOptimisticState';
import { taskMutations } from '@/features/task/lib/taskMutations';

export function useCompanyTasks(
  companyId: number,
  initialTasks: Task[],
  companies: CompanyListItem[],
) {
  const state = useOptimisticState(initialTasks);
  const tasks = state.value;
  return {
    tasks: [...tasks].sort(
      (a, b) =>
        Number(a.done) - Number(b.done) ||
        (a.deadline ?? '\uffff').localeCompare(b.deadline ?? '\uffff'),
    ),
    completedCount: tasks.filter((task) => task.done).length,
    ...taskMutations(state, companies, () => true, companyId),
  };
}
