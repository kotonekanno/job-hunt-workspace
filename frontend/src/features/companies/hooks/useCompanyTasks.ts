import type { Task } from '@/api/generated/models/task';
import type { GetCompanyLookupResponseCompaniesItem } from '@/api/generated/models/getCompanyLookupResponseCompaniesItem';
import { useOptimisticState } from '@/shared/useOptimisticState';
import { taskMutations } from '@/features/task/lib/taskMutations';

export function useCompanyTasks(
  companyId: number,
  initialTasks: Task[],
  companies: GetCompanyLookupResponseCompaniesItem[],
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
