import { useCallback, useEffect, useRef, useState } from 'react';
import type { Activity } from '@/api/generated/models/activity';
import type { UpdateCompanyActivityRequest } from '@/api/generated/models/updateCompanyActivityRequest';
import { loadCompanyActivities } from '@/features/companies/lib/companyListApi';
import {
  addActivity,
  updateActivity,
  removeActivity,
} from '@/features/companies/lib/companyDetailApi';
import { useOptimisticState, temporaryId } from '@/shared/useOptimisticState';
import { toast } from '@/shared/toast';

export function mergeActivities(current: Activity[], page: Activity[]) {
  return [
    ...new Map(
      [...current, ...page].map((activity) => [activity.id, activity]),
    ).values(),
  ].sort(
    (a, b) =>
      Date.parse(a.occurredAt) - Date.parse(b.occurredAt) || a.id - b.id,
  );
}
export function useCompanyActivities(
  companyId: number,
  initialPage?: Activity[],
) {
  const [initial] = useState(initialPage);
  const state = useOptimisticState<Activity[]>(() =>
    mergeActivities([], initialPage ?? []),
  );
  const { setValue, isBusy } = state;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialPage === undefined || initialPage.length === 20,
  );
  const nextPage = useRef(0);
  const boundary = useRef(initialPage?.length ?? 0);
  const offsetDelta = useRef(0);
  const pending = useRef(false);
  const more = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const loadNext = useCallback(async () => {
    const signal = controller.current?.signal;
    if (
      !signal ||
      signal.aborted ||
      pending.current ||
      isBusy() ||
      !more.current
    )
      return false;
    pending.current = true;
    setLoading(true);
    try {
      const pageIndex = nextPage.current;
      const page = await loadCompanyActivities(companyId, pageIndex, signal);
      if (signal.aborted) return false;
      setValue((items) => {
        const merged = mergeActivities(items, page);
        more.current =
          page.length === 20 &&
          (merged.length > items.length || offsetDelta.current !== 0);
        return merged;
      });
      nextPage.current = pageIndex + 1;
      boundary.current = (pageIndex + 1) * 20;
      offsetDelta.current = 0;
      setHasMore(more.current);
      return true;
    } catch {
      if (!signal.aborted)
        toast.error(
          'やりとり履歴を取得できませんでした。上方向にスクロールすると再試行します。',
        );
      return false;
    } finally {
      if (!signal.aborted) {
        pending.current = false;
        setLoading(false);
      }
    }
  }, [companyId, setValue, isBusy]);
  useEffect(() => {
    const request = new AbortController();
    controller.current = request;
    pending.current = false;
    nextPage.current = initial === undefined ? 0 : 1;
    boundary.current = initial?.length ?? 0;
    offsetDelta.current = 0;
    more.current = initial === undefined || initial.length === 20;
    if (initial === undefined) void loadNext();
    return () => request.abort();
  }, [loadNext, initial]);
  function shiftBoundary(delta: number) {
    offsetDelta.current += delta;
    // Offset pagination can overlap after local inserts/deletes. Adjust only the next
    // user-triggered page fetch; never reload the history after a write.
    nextPage.current = Math.max(
      0,
      Math.floor((boundary.current + offsetDelta.current) / 20),
    );
  }
  return {
    activities: state.value,
    loading,
    hasMore,
    loadNext,
    create: async (text: string, byUser: boolean) => {
      if (pending.current) return false;
      const id = temporaryId();
      const activity: Activity = {
        id,
        text,
        byUser,
        occurredAt: new Date().toISOString(),
      };
      const saved = await state.mutate(
        (items) => mergeActivities(items, [activity]),
        () => addActivity(companyId, { text, byUser }),
        (items, savedId) =>
          items.map((item) =>
            item.id === id ? { ...item, id: savedId } : item,
          ),
      );
      if (saved) shiftBoundary(1);
      return saved;
    },
    update: (id: number, request: UpdateCompanyActivityRequest) =>
      pending.current || id < 0
        ? Promise.resolve(false)
        : state.mutate(
            (items) =>
              mergeActivities(
                [],
                items.map((item) =>
                  item.id === id ? { ...item, ...request } : item,
                ),
              ),
            () => updateActivity(companyId, id, request),
          ),
    remove: async (id: number) => {
      if (pending.current || id < 0) return false;
      const saved = await state.mutate(
        (items) => items.filter((item) => item.id !== id),
        () => removeActivity(companyId, id),
      );
      if (saved) shiftBoundary(-1);
      return saved;
    },
  };
}
