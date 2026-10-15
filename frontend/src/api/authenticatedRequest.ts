import {
  checkSession,
  getAccessToken,
  getSession,
  getSessionGeneration,
  initializeSession,
} from '@/features/auth/api/session';

export async function authenticatedRequest<T extends { status: number }>(
  request: (options: RequestInit) => Promise<T>,
  options: RequestInit = {},
): Promise<T> {
  if (getSession().status === 'loading') await initializeSession();
  options.signal?.throwIfAborted();
  const startedGeneration = getSessionGeneration();
  const sentToken = getAccessToken();
  if (!sentToken) throw new Error('ログインが必要です。');
  function withToken(token: string): RequestInit {
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return {
      ...options,
      credentials: 'include',
      headers: Object.fromEntries(headers.entries()),
    };
  }
  const response = await request(withToken(sentToken));
  if (response.status !== 401) return response;
  options.signal?.throwIfAborted();
  // Never replay a previous user's request after a new login.
  if (getSessionGeneration() !== startedGeneration) return response;
  // Another request may already have refreshed this session's token.
  if (getAccessToken() === sentToken) await checkSession();
  options.signal?.throwIfAborted();
  if (getSessionGeneration() !== startedGeneration) return response;
  const token = getAccessToken();
  if (!token || token === sentToken) return response;
  const retried = await request(withToken(token));
  if (
    retried.status === 401 &&
    getSessionGeneration() === startedGeneration &&
    getAccessToken() === token
  )
    await checkSession();
  return retried;
}
