import { useState } from 'react';
import type { Task } from '@/api/generated/models/task';
import { initialTasks } from '@/features/home/model/mockTasks';

// Home remains a mock until its API migration is requested.
export function useMockTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  return { tasks, toggleTask };
}
