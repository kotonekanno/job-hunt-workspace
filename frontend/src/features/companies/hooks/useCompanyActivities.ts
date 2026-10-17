import { useCallback, useEffect, useRef, useState } from 'react';
import type { Activity } from '@/api/generated/models/activity';
import { loadCompanyActivities } from '@/features/companies/lib/companyListApi';
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

export function useCompanyActivities(companyId: number) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const items = useRef<Activity[]>([]);
  const nextPage = useRef(0);
  const pending = useRef(false);
  const more = useRef(true);
  const controller = useRef<AbortController | null>(null);

  const loadNext = useCallback(async () => {
    const signal = controller.current?.signal;
    if (!signal || signal.aborted || pending.current || !more.current)
      return false;
    pending.current = true;
    setLoading(true);
    try {
      const page = await loadCompanyActivities(
        companyId,
        nextPage.current,
        signal,
      );
      if (signal.aborted) return false;
      const merged = mergeActivities(items.current, page);
      more.current = page.length === 20 && merged.length > items.current.length;
      items.current = merged;
      nextPage.current += 1;
      setActivities(merged);
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
  }, [companyId]);

  useEffect(() => {
    const request = new AbortController();
    controller.current = request;
    pending.current = false;
    items.current = [];
    nextPage.current = 0;
    more.current = true;
    void loadNext();
    return () => request.abort();
  }, [loadNext]);
  return { activities, loading, hasMore, loadNext };
}
