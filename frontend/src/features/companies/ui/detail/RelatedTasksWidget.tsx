import { ListTodo } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '@/api/generated/models';
import { useTasks } from '@/features/task/hooks/useTasks';
import { TaskDialog } from '@/features/task/ui/TaskDialog';
import { TaskList } from '@/features/task/ui/TaskList';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { AddButton, BulkDeleteButton } from '@/shared/button';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

export function RelatedTasksWidget({
  tasks: initialTasks,
  companyName,
  companyId,
}: {
  tasks: Task[];
  companyName: string;
  companyId: number;
}) {
  const archive = useTasks(initialTasks, companyId, companyName);
  const [editing, setEditing] = useState<Task>();
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
              count={archive.completedCount}
              onConfirm={archive.deleteCompletedTasks}
            />
            <AddButton
              text="タスクを追加"
              size="s"
              onClick={() => {
                setEditing(undefined);
                setOpen(true);
              }}
            />
          </div>
        }
      >
        {archive.error && (
          <p role="alert" className="text-sm text-rose-500">
            {archive.error}
          </p>
        )}
        {!archive.tasks.length ? (
          <WidgetEmptyState text="表示できるタスクはありません" />
        ) : (
          <TaskList
            tasks={archive.tasks}
            showCompany={false}
            onToggle={archive.toggleTask}
            onDelete={archive.deleteTask}
            onEdit={(task) => {
              setEditing(task);
              setOpen(true);
            }}
          />
        )}
      </WidgetFrame>
      {open && (
        <TaskDialog
          task={editing}
          fixedCompanyId={companyId}
          defaultCompany={companyName}
          onClose={() => setOpen(false)}
          onSave={(request, name) =>
            archive.saveTask(request, editing?.id, name)
          }
        />
      )}
    </>
  );
}
