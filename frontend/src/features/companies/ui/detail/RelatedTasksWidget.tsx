import { ListTodo } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '@/api/generated/models';
import { useTasks } from '@/features/task/hooks/useTasks';
import { TaskDialog } from '@/features/task/ui/TaskDialog';
import { TaskList } from '@/features/task/ui/TaskList';
import { WidgetFrame } from './WidgetFrame';
import { AddButton, BulkDeleteButton } from '@/shared/button';
import { RequestStatus } from '@/shared/RequestStatus';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

export function RelatedTasksWidget({
  companyId,
  companyName,
}: {
  companyId: number;
  companyName: string;
}) {
  const tasks = useTasks(companyId);
  const [editingTask, setEditingTask] = useState<Task>();
  const [open, setOpen] = useState(false);
  return (
    <>
      <WidgetFrame
        title="関連タスク"
        code="RELATED_TASKS"
        icon={ListTodo}
        contentClassName="overflow-x-auto"
        action={
          <div className="flex items-center gap-2">
            <BulkDeleteButton
              size="s"
              count={tasks.completedCount}
              onConfirm={tasks.deleteCompletedTasks}
            />
            <AddButton
              text="タスクを追加"
              size="s"
              onClick={() => {
                setEditingTask(undefined);
                setOpen(true);
              }}
            />
          </div>
        }
      >
        <RequestStatus isLoading={tasks.isLoading} error={tasks.error} />
        {!tasks.isLoading && !tasks.error && !tasks.tasks.length && (
          <WidgetEmptyState text="表示できるタスクはありません" />
        )}
        <TaskList
          tasks={tasks.tasks}
          showCompany={false}
          onToggle={tasks.toggleTask}
          onEdit={(task) => {
            setEditingTask({ ...task, companyName });
            setOpen(true);
          }}
          onDelete={tasks.deleteTask}
        />
      </WidgetFrame>
      {open && (
        <TaskDialog
          task={editingTask}
          defaultCompany={companyName}
          onClose={() => setOpen(false)}
          onSave={tasks.saveTask}
        />
      )}
    </>
  );
}
