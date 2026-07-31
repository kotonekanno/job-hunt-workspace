import { ListTodo } from "lucide-react";
import { useMemo, useState } from "react";
import {
  companyProfile,
  relatedTasks,
} from "@/features/companies/model/companyDetail";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import type { Task } from "@/features/task/model/task";
import { TaskDialog } from "@/features/task/ui/TaskDialog";
import { TaskList } from "@/features/task/ui/TaskList";
import {
  AddButton,
  BulkDeleteButton,
} from "@/shared/button";

export function RelatedTasksWidget() {
  const [tasks, setTasks] = useState<Task[]>(relatedTasks);
  const [editingTask, setEditingTask] = useState<Task>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sortedTasks = useMemo(
    () => [...tasks].sort((left, right) => {
      const completionOrder = Number(left.completed) - Number(right.completed);

      if (completionOrder !== 0) {
        return completionOrder;
      }

      return (left.dueDate ?? "\uffff").localeCompare(
        right.dueDate ?? "\uffff",
      );
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
    setTasks((current) => {
      const taskExists = current.some((item) => item.id === task.id);

      if (!taskExists) {
        return [...current, task];
      }

      return current.map((item) =>
        item.id === task.id ? task : item);
    });
  }

  function openAddDialog() {
    setEditingTask(undefined);
    setIsDialogOpen(true);
  }

  function openEditDialog(task: Task) {
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
        onConfirm={() => setTasks((current) => current.filter(
          (task) => !task.completed,
        ))}
      />

      <AddButton
        text="タスクを追加"
        size="s"
        onClick={openAddDialog}
      />
    </div>
  );

  return (
    <>
      <WidgetFrame
        title="関連タスク"
        code="RELATED_TASKS"
        icon={ListTodo}
        action={actions}
      >
        <TaskList
          tasks={sortedTasks}
          showCompany={false}
          onToggle={toggleTask}
          onEdit={openEditDialog}
          onDelete={(id) => setTasks((current) => current.filter(
            (task) => task.id !== id,
          ))}
        />
      </WidgetFrame>

      {isDialogOpen && (
        <TaskDialog
          task={editingTask}
          defaultCompany={companyProfile.name}
          onClose={closeDialog}
          onSave={saveTask}
        />
      )}
    </>
  );
}
