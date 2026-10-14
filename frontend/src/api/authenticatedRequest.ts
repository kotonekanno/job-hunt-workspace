import {
  clearSession,
  getAccessToken,
  getSession,
  initializeSession,
  renewAccessToken,
} from '@/features/auth/api/session';

export async function authenticatedRequest<T extends { status: number }>(
  request: (options: RequestInit) => Promise<T>,
  options: RequestInit = {},
): Promise<T> {
  if (getSession().status === 'loading') await initializeSession();
  options.signal?.throwIfAborted();
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
  const token =
    getAccessToken() !== sentToken
      ? getAccessToken()
      : await renewAccessToken();
  options.signal?.throwIfAborted();
  if (!token) return response;
  // Retry only once; concurrent requests share the same token refresh.
  const retried = await request(withToken(token));
  if (retried.status === 401) clearSession();
  return retried;
}
