import { useSyncExternalStore } from 'react';

export type ViewId =
  | 'burn'
  | 'shed'
  | 'shred'
  | 'ritual'
  | 'laugh'
  | 'breathe'
  | 'tracker'
  | 'premium'
  | 'profile';

let view: ViewId = 'burn';
const listeners = new Set<() => void>();

const RETURN_KEY = 'bs_signin_return';

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => view;

export const navigate = (next: ViewId) => {
  if (view === next) return;
  // Navigating to Profile only happens when a feature requires sign-in, so
  // remember where the user came from and send them back after they sign in.
  if (next === 'profile') {
    try { localStorage.setItem(RETURN_KEY, view); } catch { /* ignore */ }
  }
  view = next;
  listeners.forEach(l => l());
};

/** Feature the user was on when they were sent to sign in, or null. */
export const takeSignInReturn = (): ViewId | null => {
  try {
    const target = localStorage.getItem(RETURN_KEY) as ViewId | null;
    localStorage.removeItem(RETURN_KEY);
    if (target && target !== 'profile' && target !== 'premium') return target;
  } catch { /* ignore */ }
  return null;
};

export const useView = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
