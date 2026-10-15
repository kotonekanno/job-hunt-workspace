import { useCallback, useEffect, useRef, useState } from 'react';

// Store generated data directly; loading/error state belongs to the UI.
export function useApiResource<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [state, setState] = useState({ loader, isLoading: true, error: '' });
  const active = useRef<AbortController | null>(null);
  const load = useCallback(
    (controller: AbortController) =>
      loader(controller.signal).then(
        (result) => {
          if (!controller.signal.aborted) {
            setData(result);
            setState({ loader, isLoading: false, error: '' });
          }
        },
        (cause) => {
          if (!controller.signal.aborted) {
            // Keep read errors separate so a successful write is never retried by mistake.
            setState({
              loader,
              isLoading: false,
              error:
                cause instanceof Error
                  ? cause.message
                  : 'データを取得できませんでした。',
            });
          }
        },
      ),
    [loader],
  );
  const refresh = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setState({ loader, isLoading: true, error: '' });
    await load(controller);
  }, [load, loader]);
  useEffect(() => {
    const controller = new AbortController();
    active.current = controller;
    void load(controller);
    return () => active.current?.abort();
  }, [load]);
  return {
    data: state.loader === loader ? data : undefined,
    setData,
    isLoading: state.loader !== loader || state.isLoading,
    error: state.loader === loader ? state.error : '',
    refresh,
  };
}

export function requireStatus(response: { status: number }, expected = 204) {
  if (response.status !== expected)
    throw new Error('保存できませんでした。もう一度お試しください。');
}
