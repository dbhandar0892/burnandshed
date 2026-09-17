import { useSyncExternalStore } from 'react';

// Shared text between Burn It Note and Vent Box so the same message
// can be burned or shredded from either screen.
let ventText = '';
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => ventText;

export const setVentText = (next: string) => {
  if (ventText === next) return;
  ventText = next;
  listeners.forEach((listener) => listener());
};

export const useVentText = () => useSyncExternalStore(subscribe, getSnapshot);
