import { Reorder } from "motion/react";
import type { Task } from "@/features/task/model/task";
import { TaskRow } from "@/features/task/ui/TaskRow";

type TaskListProps = {
  tasks: Task[];
  canReorder: boolean;
  showCompany?: boolean;
  showReorder?: boolean;
  showActions?: boolean;
  onToggle: (id: number) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  onReorder?: (orderedIds: number[]) => void;
};

export function TaskList(props: TaskListProps) {
  if (props.tasks.length === 0) return;

  return (
    <Reorder.Group
      axis="y"
      values={props.tasks}
      onReorder={(tasks) => {
        if (props.canReorder) {
          props.onReorder?.(tasks.map((task) => task.id));
        }
      }}
      className="w-full space-y-2 p-0"
    >
      {props.tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          canReorder={props.canReorder}
          showCompany={props.showCompany}
          showReorder={props.showReorder}
          showActions={props.showActions}
          onToggle={props.onToggle}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
        />
      ))}
    </Reorder.Group>
  );
}
