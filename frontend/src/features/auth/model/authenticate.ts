import { getCurrentUser, refresh } from '@/api/generated/api';
import type { AccessToken } from '@/api/generated/models/accessToken';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './accessToken';

let pendingAuthentication: Promise<boolean> | null = null;

async function checkToken(token: AccessToken) {
  return getCurrentUser({
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function authenticate() {
  try {
    const token = getAccessToken();
    if (token) {
      const response = await checkToken(token);
      if (response.status === 200) return true;
      if (response.status !== 401) {
        clearAccessToken();
        return false;
      }
    }

    const response = await refresh({ credentials: 'include' });
    if (
      response.status === 200 &&
      typeof response.data.accessToken === 'string' &&
      response.data.accessToken.trim()
    ) {
      const token = response.data.accessToken;
      const verification = await checkToken(token);
      if (verification.status === 200) {
        setAccessToken(token);
        return true;
      }
    }
  } catch {
    // Network and response parsing failures also leave the route unauthenticated.
  }

  clearAccessToken();
  return false;
}

export function ensureAuthenticated(): Promise<boolean> {
  // Share the in-flight check, including React StrictMode's effect replay.
  if (!pendingAuthentication) {
    pendingAuthentication = authenticate().finally(() => {
      pendingAuthentication = null;
    });
  }
  return pendingAuthentication;
}
