import { useSyncExternalStore } from 'react';
import type { AccessToken } from '@/api/generated/models/accessToken';

const storageKey = 'job-hunt-access-token';
const changeEvent = 'job-hunt-auth-change';

export function getAccessToken(): AccessToken | null {
  return sessionStorage.getItem(storageKey)?.trim() || null;
}

export function setAccessToken(token: AccessToken) {
  sessionStorage.setItem(storageKey, token);
  window.dispatchEvent(new Event(changeEvent));
}

export function clearAccessToken() {
  sessionStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener('storage', listener);
  };
}

export function useAccessToken() {
  return useSyncExternalStore(subscribe, getAccessToken);
}
