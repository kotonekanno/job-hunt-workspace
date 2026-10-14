import { getCurrentUser, login, refresh, register } from '@/api/generated/api';
import type { AccessToken, AuthRequest } from '@/api/generated/models';

type SessionState =
  | { status: 'loading' | 'authenticated' | 'anonymous'; error: '' }
  | { status: 'error'; error: string };

let state: SessionState = { status: 'loading', error: '' };
let accessToken: AccessToken | null = null;
let initialization: Promise<void> | undefined;
let refreshing: Promise<AccessToken | null> | undefined;
const listeners = new Set<() => void>();
export const getSession = () => state;
export const getAccessToken = () => accessToken;
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function publish(next: SessionState) {
  state = next;
  listeners.forEach((listener) => listener());
}
export function clearSession() {
  accessToken = null;
  publish({ status: 'anonymous', error: '' });
}
export function renewAccessToken(): Promise<AccessToken | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const response = await refresh({ credentials: 'include' });
    if (response.status === 401 || response.status === 404) {
      clearSession();
      return null;
    }
    if (response.status !== 200)
      throw new Error('セッションを更新できませんでした。');
    accessToken = response.data.accessToken;
    return accessToken;
  })().finally(() => {
    refreshing = undefined;
  });
  return refreshing;
}
async function verifySession(token: AccessToken) {
  const response = await getCurrentUser({
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) {
    clearSession();
    return false;
  }
  if (response.status !== 200)
    throw new Error('認証状態を確認できませんでした。');
  publish({ status: 'authenticated', error: '' });
  return true;
}
export function initializeSession(): Promise<void> {
  if (initialization) return initialization;
  if (state.status !== 'loading') return Promise.resolve();
  initialization = (async () => {
    try {
      const token = accessToken ?? (await renewAccessToken());
      if (token) await verifySession(token);
    } catch (cause) {
      publish({
        status: 'error',
        error:
          cause instanceof Error
            ? cause.message
            : '認証状態を確認できませんでした。',
      });
    }
  })().finally(() => {
    initialization = undefined;
  });
  return initialization;
}
export async function retrySession() {
  publish({ status: 'loading', error: '' });
  await initializeSession();
}
export async function signIn(request: AuthRequest) {
  await initializeSession();
  const response = await login(request, { credentials: 'include' });
  if (response.status !== 200) {
    const messages: Partial<Record<number, string>> = {
      400: 'メールアドレスとパスワードを確認してください。',
      401: 'メールアドレスまたはパスワードが正しくありません。',
      403: 'このアカウントは未認証です。',
      404: 'アカウントが見つかりません。',
    };
    throw new Error(messages[response.status] ?? 'ログインできませんでした。');
  }
  accessToken = response.data.accessToken;
  try {
    if (!(await verifySession(accessToken)))
      throw new Error('認証状態を確認できませんでした。');
  } catch (cause) {
    clearSession();
    throw cause;
  }
}
export async function signUp(request: AuthRequest) {
  const response = await register(request, { credentials: 'include' });
  if (response.status !== 201)
    throw new Error(
      response.status === 409
        ? 'このメールアドレスは既に登録されています。'
        : 'アカウントを作成できませんでした。',
    );
  return response.data;
}
