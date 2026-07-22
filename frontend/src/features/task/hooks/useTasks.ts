import { useMemo, useState } from "react";
import { initialTasks, type Task, type TaskSort } from "@/features/task/model/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [companyQuery, setCompanyQuery] = useState("");
  const [sort, setSort] = useState<TaskSort>("手動");

  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => !companyQuery || task.company?.toLowerCase().includes(companyQuery.toLowerCase()));
    const sorted = sort === "期限が近い順"
      ? [...filtered].sort((left, right) => left.dueDate.localeCompare(right.dueDate))
      : sort === "企業名順"
        ? [...filtered].sort((left, right) => (left.company ?? "").localeCompare(right.company ?? "", "ja"))
        : filtered;
    return [...sorted].sort((left, right) => Number(left.completed) - Number(right.completed));
  }, [tasks, companyQuery, sort]);

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

  function reorderTasks(orderedIds: number[]) {
    setTasks((current) => orderedIds.map((id) => current.find((task) => task.id === id)).filter((task): task is Task => task !== undefined));
  }

  return { tasks: visibleTasks, companyQuery, sort, completedCount: tasks.filter((task) => task.completed).length, setCompanyQuery, setSort, toggleTask, saveTask, deleteTask, deleteCompletedTasks, reorderTasks };
}
