import { useEffect } from 'react';
import type { GetDashboardResponse } from '@/api/generated/models/getDashboardResponse';
import type { SelectionStatus } from '@/api/generated/models/selectionStatus';
import { useOptimisticState } from '@/shared/useOptimisticState';
import { toast } from '@/shared/toast';
import { loadDashboard } from '../lib/dashboardApi';
import { toggleTaskRequest } from '@/features/task/lib/taskApi';
import { changeCompanyStatus } from '@/features/companies/lib/companyListApi';

export function useDashboard() {
  const state = useOptimisticState<GetDashboardResponse | undefined>(undefined);
  const { value: dashboard, setValue } = state;
  useEffect(() => {
    const controller = new AbortController();
    void loadDashboard(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setValue(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          toast.error(
            'ホームの情報を取得できませんでした。画面を再読み込みしてください。',
          );
      });
    return () => controller.abort();
  }, [setValue]);

  return {
    dashboard,
    toggleTask: (id: number) => {
      const task = dashboard?.tasks.find((item) => item.id === id);
      if (!task) return;
      void state.mutate(
        (current) =>
          current
            ? {
                ...current,
                tasks: current.tasks.map((item) =>
                  item.id === id ? { ...item, done: !item.done } : item,
                ),
                counts: {
                  ...current.counts,
                  undoneTasks: Math.max(
                    0,
                    current.counts.undoneTasks + (task.done ? 1 : -1),
                  ),
                },
              }
            : current,
        () => toggleTaskRequest(task),
      );
    },
    updateSelectionResult: (id: number, status: SelectionStatus) => {
      const company = dashboard?.companies.find((item) => item.id === id);
      if (!company?.currentSelection || company.priority === 7) return;
      void state.mutate(
        (current) =>
          current
            ? {
                ...current,
                companies: current.companies.map((item) =>
                  item.id === id && item.currentSelection
                    ? {
                        ...item,
                        currentSelection: {
                          ...item.currentSelection,
                          step: { ...item.currentSelection.step, status },
                        },
                      }
                    : item,
                ),
              }
            : current,
        () => changeCompanyStatus(company, status),
      );
    },
  };
}
