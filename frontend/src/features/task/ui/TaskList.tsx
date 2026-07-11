import { Reorder } from "motion/react";
import type { Task } from "@/features/task/model/task";
import { TaskRow } from "@/features/task/ui/TaskRow";

type TaskListProps = {
  tasks: Task[];
  canReorder: boolean;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onReorder: (orderedIds: number[]) => void;
};

export function TaskList(props: TaskListProps) {
  if (props.tasks.length === 0) return <div className="cyber-cut border border-[var(--line)] bg-[var(--panel)] py-16 text-center text-sm text-[var(--faint)]">該当するタスクはありません。</div>;

  return (
    <Reorder.Group axis="y" values={props.tasks} onReorder={(tasks) => props.canReorder && props.onReorder(tasks.map((task) => task.id))} className="w-full space-y-2 p-0">
      {props.tasks.map((task) => <TaskRow key={task.id} task={task} canReorder={props.canReorder} onToggle={props.onToggle} onEdit={props.onEdit} onDelete={props.onDelete} />)}
    </Reorder.Group>
  );
}
