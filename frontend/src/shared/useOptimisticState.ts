import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from 'react';
import { toast } from '@/shared/toast';

function isUpdater<T>(value: SetStateAction<T>): value is (previous: T) => T {
  return typeof value === 'function';
}

let nextTemporaryId = -1;
export function temporaryId() {
  return nextTemporaryId--;
}

// Serialize writes for a collection so rollback never erases another pending edit.
export function useOptimisticState<T>(initial: T | (() => T)) {
  const [value, render] = useState(initial);
  const current = useRef(value);
  const busy = useRef(false);
  const alive = useRef(true);
  const revision = useRef(0);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const setValue = useCallback((next: SetStateAction<T>) => {
    current.current = isUpdater(next) ? next(current.current) : next;
    revision.current += 1;
    if (alive.current) render(current.current);
  }, []);
  async function mutate<R>(
    optimistic: (previous: T) => T,
    request: () => Promise<R>,
    reconcile?: (current: T, result: R) => T,
    rollback?: (before: T) => T,
  ) {
    if (busy.current || !alive.current) return false;
    busy.current = true;
    const before = current.current;
    let version = revision.current;
    try {
      setValue(optimistic(before));
      version = revision.current;
      const result = await request();
      if (alive.current && version === revision.current && reconcile)
        setValue(reconcile(current.current, result));
      return true;
    } catch (error) {
      if (alive.current && version === revision.current)
        setValue(rollback ? rollback(before) : before);
      toast.error(
        error instanceof Error
          ? error.message
          : '保存に失敗しました。もう一度お試しください。',
      );
      return false;
    } finally {
      busy.current = false;
    }
  }
  const isBusy = useCallback(() => busy.current, []);
  return { value, setValue, mutate, isBusy };
}
