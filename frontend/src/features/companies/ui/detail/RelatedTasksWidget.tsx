import { ListTodo } from 'lucide-react';
import { useState } from 'react';
import { useCompanyTasks } from '@/features/companies/hooks/useCompanyTasks';
import type { GetCompanyLookupResponseCompaniesItem } from '@/api/generated/models/getCompanyLookupResponseCompaniesItem';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import type { Task } from '@/api/generated/models/task';
import { TaskDialog } from '@/features/task/ui/TaskDialog';
import { TaskList } from '@/features/task/ui/TaskList';
import { AddButton, BulkDeleteButton } from '@/shared/button';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

export function RelatedTasksWidget({
  companyId,
  companyName,
  initialTasks,
  companies,
  prepareCompanies,
}: {
  companyId: number;
  companyName: string;
  initialTasks: Task[];
  companies: GetCompanyLookupResponseCompaniesItem[];
  prepareCompanies: () => Promise<boolean>;
}) {
  const {
    tasks: sortedTasks,
    completedCount,
    toggleTask,
    saveTask,
    deleteTask,
    deleteCompletedTasks,
  } = useCompanyTasks(companyId, initialTasks, companies);
  const [editingTask, setEditingTask] = useState<Task>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function openAddDialog() {
    if (!(await prepareCompanies())) return;
    setEditingTask(undefined);
    setIsDialogOpen(true);
  }

  async function openEditDialog(task: Task) {
    if (!(await prepareCompanies())) return;
    setEditingTask(task);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setEditingTask(undefined);
    setIsDialogOpen(false);
  }

  const actions = (
    <div className="flex items-center gap-2">
      <BulkDeleteButton
        size="s"
        count={completedCount}
        onConfirm={deleteCompletedTasks}
      />

      <AddButton text="タスクを追加" size="s" onClick={openAddDialog} />
    </div>
  );

  return (
    <>
      <WidgetFrame
        title="関連タスク"
        code="RELATED_TASKS"
        icon={ListTodo}
        action={actions}
        contentClassName="max-h-[24rem] overflow-auto"
      >
        {sortedTasks.length === 0 ? (
          <WidgetEmptyState text="表示できるタスクはありません" />
        ) : (
          <TaskList
            tasks={sortedTasks}
            showCompany={false}
            onToggle={toggleTask}
            onEdit={openEditDialog}
            onDelete={deleteTask}
          />
        )}
      </WidgetFrame>

      {isDialogOpen && (
        <TaskDialog
          task={editingTask}
          defaultCompany={companyName}
          companyOptions={companies.map((company) => company.name)}
          onClose={closeDialog}
          onSave={saveTask}
        />
      )}
    </>
  );
}
