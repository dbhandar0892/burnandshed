import { useSyncExternalStore } from 'react';
import { getPremium } from './premium';

export type ThemeMode = 'light' | 'dark';
export type Palette = 'violet' | 'ember' | 'ocean' | 'forest';

export const PALETTES: { id: Palette; label: string; swatch: string; premium: boolean }[] = [
  { id: 'violet', label: 'Violet', swatch: 'hsl(250 75% 62%)', premium: false },
  { id: 'ember', label: 'Ember', swatch: 'hsl(18 88% 52%)', premium: true },
  { id: 'ocean', label: 'Ocean', swatch: 'hsl(196 78% 45%)', premium: true },
  { id: 'forest', label: 'Forest', swatch: 'hsl(158 55% 38%)', premium: true },
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
  const stored = read();
  const premium = getPremium().active;
  const mode = premium ? stored.mode : 'light';
  const palette = premium ? stored.palette : 'violet';

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
