import {
  getCurrentUser,
  login,
  logout,
  refresh,
  register,
} from '@/api/generated/api';
import type { AccessToken, AuthRequest } from '@/api/generated/models';

type SessionState =
  | { status: 'loading' | 'authenticated' | 'anonymous'; error: '' }
  | { status: 'error'; error: string };

let state: SessionState = { status: 'loading', error: '' };
let accessToken: AccessToken | null = null;
let generation = 0;
let checking: Promise<void> | undefined;
let refreshing: Promise<AccessToken | null> | undefined;
const listeners = new Set<() => void>();
export const getSession = () => state;
export const getAccessToken = () => accessToken;
export const getSessionGeneration = () => generation;
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
  generation += 1;
  accessToken = null;
  checking = undefined;
  refreshing = undefined;
  publish({ status: 'anonymous', error: '' });
}
function tokenOptions(token: AccessToken | null): RequestInit {
  return {
    credentials: 'include',
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
export function renewAccessToken(): Promise<AccessToken | null> {
  if (refreshing) return refreshing;
  const startedGeneration = generation;
  const sentToken = accessToken;
  const operation = (async () => {
    const response = await refresh({ credentials: 'include' });
    // A response from an old login must not replace the current token.
    if (generation !== startedGeneration || accessToken !== sentToken)
      return accessToken;
    if (response.status === 401 || response.status === 404) return null;
    if (response.status !== 200)
      throw new Error('セッションを更新できませんでした。');
    accessToken = response.data.accessToken;
    return accessToken;
  })();
  refreshing = operation;
  void operation
    .finally(() => {
      if (refreshing === operation) refreshing = undefined;
    })
    .catch(() => {});
  return operation;
}

// Revalidate on protected navigation and on resource 401s. Only /auth/me and
// refresh failures establish that a login is required; ordinary API errors do not.
export function checkSession(): Promise<void> {
  if (checking) return checking;
  const startedGeneration = generation;
  const operation = (async () => {
    try {
      const restoring = accessToken === null;
      const sentToken = accessToken ?? (await renewAccessToken());
      if (generation !== startedGeneration) return;
      if (!sentToken) {
        clearSession();
        return;
      }
      let response = await getCurrentUser(tokenOptions(sentToken));
      if (generation !== startedGeneration) return;
      if (response.status === 401 && !restoring) {
        const token =
          accessToken !== sentToken ? accessToken : await renewAccessToken();
        if (generation !== startedGeneration) return;
        if (!token) {
          clearSession();
          return;
        }
        response = await getCurrentUser(tokenOptions(token));
      }
      if (generation !== startedGeneration) return;
      if (response.status === 401) {
        clearSession();
        return;
      }
      if (response.status !== 200)
        throw new Error('認証状態を確認できませんでした。');
      publish({ status: 'authenticated', error: '' });
    } catch (cause) {
      if (generation === startedGeneration)
        publish({
          status: 'error',
          error:
            cause instanceof Error
              ? cause.message
              : '認証状態を確認できませんでした。',
        });
    }
  })();
  checking = operation;
  void operation.finally(() => {
    if (checking === operation) checking = undefined;
  });
  return operation;
}
export function initializeSession(): Promise<void> {
  if (checking) return checking;
  return state.status === 'loading' ? checkSession() : Promise.resolve();
}
export const retrySession = checkSession;

export async function signIn(request: AuthRequest) {
  await initializeSession();
  const startedGeneration = ++generation;
  checking = undefined;
  refreshing = undefined;
  const response = await login(request, { credentials: 'include' });
  if (generation !== startedGeneration)
    throw new Error('ログインをやり直してください。');
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
  const verified = await getCurrentUser(tokenOptions(accessToken));
  if (generation !== startedGeneration)
    throw new Error('ログインをやり直してください。');
  if (verified.status !== 200) {
    if (verified.status === 401) clearSession();
    throw new Error('認証状態を確認できませんでした。');
  }
  publish({ status: 'authenticated', error: '' });
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

export async function signOut() {
  // Finish a pending refresh before deleting its cookie on the server.
  await initializeSession();
  if (refreshing) await refreshing;
  const startedGeneration = generation;
  const response = await logout(tokenOptions(accessToken));
  if (response.status !== 204)
    throw new Error('ログアウトできませんでした。もう一度お試しください。');
  if (generation === startedGeneration) clearSession();
}
