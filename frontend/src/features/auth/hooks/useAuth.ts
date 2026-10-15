import { useSyncExternalStore } from 'react';
import {
  getSession,
  subscribeSession,
  signIn,
  signUp,
  signOut,
  retrySession,
} from '@/features/auth/api/session';

export function useAuth() {
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    getSession,
  );
  return { ...session, signIn, signUp, signOut, retrySession };
}
