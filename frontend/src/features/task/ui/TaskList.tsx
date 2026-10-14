import { motion } from 'motion/react';
import type { Task } from '@/features/task/model/task';
import { TaskRow } from '@/features/task/ui/TaskRow';

type TaskListProps<T extends Task> = {
  tasks: T[];
  showCompany?: boolean;
  showActions?: boolean;
  onToggle: (id: number) => void;
  onEdit?: (task: T) => void;
  onDelete?: (id: number) => void | Promise<void>;
};

export function TaskList<T extends Task>(props: TaskListProps<T>) {
  if (props.tasks.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      {props.tasks.map((task) => (
        <motion.div
          key={task.id}
          layout="position"
          transition={{
            layout: {
              type: 'spring',
              stiffness: 420,
              damping: 34,
              mass: 0.75,
            },
          }}
        >
          <TaskRow
            task={task}
            showCompany={props.showCompany}
            showActions={props.showActions}
            onToggle={props.onToggle}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
}
