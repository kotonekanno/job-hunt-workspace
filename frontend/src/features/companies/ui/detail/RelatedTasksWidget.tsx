import { useMemo, useState } from "react";
import { relatedTasks } from "@/features/companies/model/companyDetail";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import type { Task } from "@/features/task/model/task";
import { TaskDialog } from "@/features/task/ui/TaskDialog";
import { TaskList } from "@/features/task/ui/TaskList";
import { BulkDeleteButton } from "@/shared/button";

export function RelatedTasksWidget() {
  const [tasks, setTasks] = useState<Task[]>(relatedTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sortedTasks = useMemo(
    () => [...tasks].sort((left, right) => {
      const completionOrder = Number(left.completed) - Number(right.completed);

      if (completionOrder !== 0) {
        return completionOrder;
      }

      return left.dueDate.localeCompare(right.dueDate);
    }),
    [tasks],
  );

  const completedCount = tasks.filter((task) => task.completed).length;

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task));
  }

  function saveTask(task: Task) {
    setTasks((current) => current.map((item) =>
      item.id === task.id ? task : item));
  }

  const deleteCompletedButton = (
    <BulkDeleteButton
      size="s"
      count={completedCount}
      onConfirm={() => setTasks((current) => current.filter(
        (task) => !task.completed,
      ))}
    />
  );

  return (
    <>
      <WidgetFrame
        title="関連タスク"
        code="RELATED_TASKS"
        action={deleteCompletedButton}
      >
        <TaskList
          tasks={sortedTasks}
          canReorder={false}
          showCompany={false}
          showReorder={false}
          onToggle={toggleTask}
          onEdit={setEditingTask}
          onDelete={(id) => setTasks((current) => current.filter(
            (task) => task.id !== id,
          ))}
        />
      </WidgetFrame>

      {editingTask && (
        <TaskDialog
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={saveTask}
        />
      )}
    </>
  );
}
