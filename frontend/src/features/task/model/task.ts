import type { Task } from '@/api/generated/models/task';

// 入力中は未採番のタスクと空文字を扱う。
export type TaskForm = Omit<Task, 'id'> & { id?: number };
