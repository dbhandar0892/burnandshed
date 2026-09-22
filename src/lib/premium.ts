import { useSyncExternalStore } from 'react';

const KEY = 'premiumUnlocked';
const TRIAL_KEY = 'premiumTrialStart';
const TRIAL_DAYS = 7;

const listeners = new Set<() => void>();
let cache: PremiumState | null = null;

export interface PremiumState {
  active: boolean;
  source: 'none' | 'trial' | 'purchased';
  trialDaysLeft: number;
}

const build = (): PremiumState => {
  const purchased = localStorage.getItem(KEY) === '1';
  const startRaw = Number.parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
  const start = Number.isFinite(startRaw) && startRaw > 0 ? startRaw : 0;
  const msLeft = start ? start + TRIAL_DAYS * 86400000 - Date.now() : 0;
  const trialActive = msLeft > 0;

  return {
    active: purchased || trialActive,
    source: purchased ? 'purchased' : trialActive ? 'trial' : 'none',
    trialDaysLeft: trialActive ? Math.ceil(msLeft / 86400000) : 0,
  };
};

const emit = () => {
  cache = build();
  listeners.forEach(l => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getPremium = (): PremiumState => {
  if (!cache) cache = build();
  return cache;
};

export const usePremium = () => useSyncExternalStore(subscribe, getPremium, getPremium);

export const startTrial = () => {
  if (!localStorage.getItem(TRIAL_KEY)) {
    localStorage.setItem(TRIAL_KEY, Date.now().toString());
  }
  emit();
};

export const hasUsedTrial = () => Boolean(localStorage.getItem(TRIAL_KEY));

/** Placeholder for real billing — unlocks everything on this device. */
export const setPremiumUnlocked = (unlocked: boolean) => {
  if (unlocked) localStorage.setItem(KEY, '1');
  else localStorage.removeItem(KEY);
  emit();
};

export const TRIAL_LENGTH_DAYS = TRIAL_DAYS;
