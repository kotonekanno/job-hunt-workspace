import { useEffect, useState } from 'react';
import { getCompanies } from '@/api/generated/api';
import type { CompanyListItem } from '@/api/generated/models';
import { authenticatedRequest } from '@/api/authenticatedRequest';

export function useCompanyOptions() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await authenticatedRequest(
          (options) => getCompanies(options),
          { signal: controller.signal },
        );
        if (response.status !== 200)
          throw new Error('企業一覧を取得できませんでした。');
        if (!controller.signal.aborted) setCompanies(response.data.companies);
      } catch {
        if (!controller.signal.aborted)
          setError('企業一覧を取得できませんでした。');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  return { companies, isLoading, error };
}
