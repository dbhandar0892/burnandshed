import { useSyncExternalStore } from 'react';
import { getPremium, subscribePremium } from './premium';

export type ThemeMode = 'light' | 'dark';
export type Palette = 'violet';

export const PALETTES: { id: Palette; label: string; swatch: string; premium: boolean }[] = [
  { id: 'violet', label: 'Violet', swatch: 'hsl(250 75% 62%)', premium: false },
];

const MODE_KEY = 'themeMode';
const PALETTE_KEY = 'themePalette';

interface ThemeState {
  mode: ThemeMode;
  palette: Palette;
}

const listeners = new Set<() => void>();
let cache: ThemeState | null = null;

const read = (): ThemeState => ({
  mode: localStorage.getItem(MODE_KEY) === 'dark' ? 'dark' : 'light',
  palette: (localStorage.getItem(PALETTE_KEY) as Palette) || 'violet',
});

export const applyTheme = () => {
  localStorage.setItem(PALETTE_KEY, 'violet');
  const stored = read();
  const premium = getPremium().active;
  const mode = premium ? stored.mode : 'light';
  const palette: Palette = 'violet';

  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.dataset.palette = palette;
};

const emit = () => {
  cache = read();
  applyTheme();
  listeners.forEach(l => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): ThemeState => {
  if (!cache) cache = read();
  return cache;
};

export const useTheme = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const setThemeMode = (mode: ThemeMode) => {
  localStorage.setItem(MODE_KEY, mode);
  emit();
};

export const setPalette = (palette: Palette) => {
  localStorage.setItem(PALETTE_KEY, palette);
  emit();
};

export const refreshTheme = emit;

// Re-apply (and downgrade if needed) whenever Premium status changes.
subscribePremium(() => emit());
