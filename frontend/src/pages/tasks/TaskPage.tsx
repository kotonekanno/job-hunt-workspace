import { useState } from "react";
import { useTasks } from "@/features/task/hooks/useTasks";
import type { Task } from "@/features/task/model/task";
import { TaskDialog } from "@/features/task/ui/TaskDialog";
import { TaskList } from "@/features/task/ui/TaskList";
import { TaskToolbar } from "@/features/task/ui/TaskToolbar";
import { FloatingAddButton } from "@/shared/button";
import { InnerHeader } from "@/shared/header";
import { Clipboard } from "lucide-react";

export function TaskPage() {
  const tasks = useTasks();
  const [editingTask, setEditingTask] = useState<Task>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className="mx-auto w-full max-w-6xl">
      <InnerHeader
        title="タスク"
        subTitle="TASK MANAGEMENT"
        icon={<Clipboard className="size-5 text-[var(--accent)]" />}
      />

      <TaskToolbar
        companyQuery={tasks.companyQuery}
        completedCount={tasks.completedCount}
        onCompanyQueryChange={tasks.setCompanyQuery}
        onDeleteCompleted={tasks.deleteCompletedTasks}
      />
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[700px]">
          <TaskList
            tasks={tasks.tasks}
            onToggle={tasks.toggleTask}
            onEdit={openEditDialog}
            onDelete={tasks.deleteTask}
          />
        </div>
      </div>

      <FloatingAddButton
        text="タスクを追加"
        onClick={openAddDialog}
      />

      {isDialogOpen && (
        <TaskDialog
          task={editingTask}
          onClose={closeDialog}
          onSave={tasks.saveTask}
        />
      )}
    </div>
  );
}
