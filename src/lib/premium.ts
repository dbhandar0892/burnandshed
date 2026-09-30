import { useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { navigate } from '@/lib/nav';
import { toast } from 'sonner';

const KEY = 'premiumUnlocked'; // preview unlock placeholder for real billing
const TRIAL_KEY = 'premiumTrialStart'; // legacy device-only trial
const ACCOUNT_KEY = 'burnshed_account_entitlement';
export const PENDING_TRIAL_KEY = 'burnshed_pending_trial';
const TRIAL_DAYS = 7;

interface AccountEntitlement {
  userId: string;
  trialStart: number; // ms, 0 = none
  premium: boolean;
}

const listeners = new Set<() => void>();
let signedIn = false;
let cache: PremiumState | null = null;

export interface PremiumState {
  active: boolean;
  source: 'none' | 'trial' | 'purchased';
  trialDaysLeft: number;
  /** Whether a trial was ever started on this device or signed-in account. */
  trialUsed: boolean;
  /** Premium features require being signed in. */
  signedIn: boolean;
}

const readAccount = (): AccountEntitlement | null => {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as AccountEntitlement) : null;
  } catch {
    return null;
  }
};

const build = (): PremiumState => {
  const account = readAccount();
  const purchased = localStorage.getItem(KEY) === '1' || Boolean(account?.premium);
  const localRaw = Number.parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
  const localStart = Number.isFinite(localRaw) && localRaw > 0 ? localRaw : 0;
  const start = Math.max(localStart, account?.trialStart ?? 0);
  const msLeft = start ? start + TRIAL_DAYS * 86400000 - Date.now() : 0;
  const trialActive = msLeft > 0;

  return {
    active: signedIn && (purchased || trialActive),
    source: purchased ? 'purchased' : trialActive ? 'trial' : 'none',
    trialDaysLeft: trialActive ? Math.ceil(msLeft / 86400000) : 0,
    trialUsed: start > 0,
    signedIn,
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

export const subscribePremium = subscribe;

export const getPremium = (): PremiumState => {
  if (!cache) cache = build();
  return cache;
};

export const usePremium = () => useSyncExternalStore(subscribe, getPremium, getPremium);

export const hasUsedTrial = () => getPremium().trialUsed;

const saveAccount = (row: { user_id: string; trial_started_at: string | null; premium: boolean }) => {
  const entitlement: AccountEntitlement = {
    userId: row.user_id,
    trialStart: row.trial_started_at ? new Date(row.trial_started_at).getTime() : 0,
    premium: row.premium,
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(entitlement));
  emit();
};

/**
 * Starts (or loads) the signed-in account's one-time trial. The trial is saved
 * on the account, so it follows the person across devices and sign-ins.
 */
export const startTrial = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('start_trial');
  if (error || !data) return false;
  saveAccount(data as { user_id: string; trial_started_at: string | null; premium: boolean });
  return true;
};

let syncing = false;
let started = false;

/** Keeps Premium status in sync with the signed-in account. Call once at app start. */
export const initPremiumSync = () => {
  if (started) return;
  started = true;

  supabase.auth.getSession().then(({ data }) => {
    signedIn = Boolean(data.session?.user);
    emit();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    const nowSignedIn = Boolean(session?.user);
    if (nowSignedIn !== signedIn) {
      signedIn = nowSignedIn;
      emit();
    }
    if (!session?.user) {
      // Keep the last account's entitlement on this device after sign-out so
      // returning members are still recognized and never see the paywall again.
      return;
    }
    const userId = session.user.id;
    const cached = readAccount();
    if (cached && cached.userId !== userId) {
      localStorage.removeItem(ACCOUNT_KEY);
      emit();
    }
    if (syncing) return;
    syncing = true;
    // Defer so we never call the backend inside the auth callback.
    setTimeout(async () => {
      const hadPremium = getPremium().active;
      const pending = localStorage.getItem(PENDING_TRIAL_KEY) === '1';
      // Every signed-in account gets its one-time trial automatically.
      const ok = await startTrial();
      syncing = false;
      if (pending) {
        localStorage.removeItem(PENDING_TRIAL_KEY);
        if (ok && getPremium().active) {
          if (!hadPremium) toast.success(`${TRIAL_DAYS}-day free trial started`);
          navigate('ritual');
        }
      }
    }, 0);
  });
};

/** Placeholder for real billing — unlocks everything on this device. */
export const setPremiumUnlocked = (unlocked: boolean) => {
  if (unlocked) localStorage.setItem(KEY, '1');
  else localStorage.removeItem(KEY);
  emit();
};

export const TRIAL_LENGTH_DAYS = TRIAL_DAYS;
