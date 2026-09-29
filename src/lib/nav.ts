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

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => view;

export const navigate = (next: ViewId) => {
  if (view === next) return;
  view = next;
  listeners.forEach(l => l());
};

export const useView = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
