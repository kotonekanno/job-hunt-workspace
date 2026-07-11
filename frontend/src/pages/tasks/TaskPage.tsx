import { useState } from "react";
import { useTasks } from "@/features/task/hooks/useTasks";
import type { Task } from "@/features/task/model/task";
import { TaskDialog } from "@/features/task/ui/TaskDialog";
import { TaskList } from "@/features/task/ui/TaskList";
import { TaskToolbar } from "@/features/task/ui/TaskToolbar";

export function TaskPage() {
  const tasks = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <TaskToolbar companyQuery={tasks.companyQuery} sort={tasks.sort} completedCount={tasks.completedCount} onCompanyQueryChange={tasks.setCompanyQuery} onSortChange={tasks.setSort} onDeleteCompleted={tasks.deleteCompletedTasks} />
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[700px]">
          <TaskList tasks={tasks.tasks} canReorder={tasks.sort === "手動" && !tasks.companyQuery} onToggle={tasks.toggleTask} onEdit={setEditingTask} onDelete={tasks.deleteTask} onReorder={tasks.reorderTasks} />
        </div>
      </div>
      {editingTask && <TaskDialog task={editingTask} onClose={() => setEditingTask(null)} onSave={tasks.saveTask} />}
    </div>
  );
}
