import { useOptimisticState } from '@/shared/useOptimisticState';
import { useEffect, useRef, useState } from 'react';
import type { GetCompanyResponse } from '@/api/generated/models/getCompanyResponse';
import { loadCompany } from '@/features/companies/lib/companyDetailApi';

export function useCompanyDetail(id: number) {
  const state = useOptimisticState<GetCompanyResponse | undefined>(undefined);
  const { value: detail, setValue: setDetail } = state;
  const [message, setMessage] = useState('読み込み中…');
  const mounted = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    mounted.current = true;
    void (async () => {
      try {
        if (!Number.isInteger(id) || id <= 0 || id > 2147483647)
          throw new Error('企業が見つかりませんでした。');
        const data = await loadCompany(id, controller.signal);
        if (controller.signal.aborted) return;
        setDetail(data);
      } catch (error) {
        if (!controller.signal.aborted)
          setMessage(
            error instanceof Error
              ? error.message
              : '企業情報を取得できませんでした。',
          );
      }
    })();
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [id, setDetail]);
  return { detail, setDetail, message, mutate: state.mutate };
}
