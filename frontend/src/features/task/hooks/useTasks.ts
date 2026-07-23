import { useMemo, useState } from "react";
import { initialTasks, type Task } from "@/features/task/model/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [companyQuery, setCompanyQuery] = useState("");

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) =>
      !companyQuery
      || task.company?.toLowerCase().includes(companyQuery.toLowerCase()));

    return [...filtered].sort((left, right) => {
      const completionOrder =
        Number(left.completed) - Number(right.completed);

      if (completionOrder !== 0) {
        return completionOrder;
      }

      return (left.dueDate ?? "\uffff").localeCompare(
        right.dueDate ?? "\uffff",
      );
    });
  }, [tasks, companyQuery]);

  function toggleTask(id: number) {
    setTasks((current) => current
      .map((task) => task.id === id ? { ...task, completed: !task.completed } : task)
      .sort((left, right) => Number(left.completed) - Number(right.completed)));
  }

  function saveTask(task: Task) {
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id);

      if (exists) {
        return current.map((item) => item.id === task.id ? task : item);
      }

      return [task, ...current];
    });
  }

  function deleteTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function deleteCompletedTasks() {
    setTasks((current) => current.filter((task) => !task.completed));
  }

  return {
    tasks: visibleTasks,
    companyQuery,
    completedCount: tasks.filter((task) => task.completed).length,
    setCompanyQuery,
    toggleTask,
    saveTask,
    deleteTask,
    deleteCompletedTasks,
  };
}
