import { useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { initBilling, logOutBilling, isNativeBilling } from '@/lib/billing';
import { hasPremiumAccess } from '@/lib/purchaseFlow';
import { navigate, takeSignInReturn } from '@/lib/nav';
import { POST_SIGNIN_RETURN_KEY } from '@/lib/authHandoff';
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
let signedInUserId: string | null = null;
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
  const native = isNativeBilling();
  const previewUnlocked = localStorage.getItem(KEY) === '1';
  const purchased = Boolean(account?.premium) || (!native && previewUnlocked);
  const localRaw = Number.parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
  const localStart = Number.isFinite(localRaw) && localRaw > 0 ? localRaw : 0;
  const start = Math.max(localStart, account?.trialStart ?? 0);
  const msLeft = start ? start + TRIAL_DAYS * 86400000 - Date.now() : 0;
  const trialActive = !native && msLeft > 0;

  return {
    active: hasPremiumAccess(native, signedIn, Boolean(account?.premium), previewUnlocked, trialActive),
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
  if (isNativeBilling()) return false;
  const { data, error } = await supabase.rpc('start_trial');
  if (error || !data) return false;
  saveAccount(data as { user_id: string; trial_started_at: string | null; premium: boolean });
  return true;
};

/**
 * Marks the cached account entitlement as paid after a store-verified purchase
 * or restore. The backend copy is synced separately by the billing webhook.
 */
export const markAccountPremium = () => {
  const account = readAccount();
  if (!signedInUserId) return;
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ userId: signedInUserId, trialStart: account?.userId === signedInUserId ? account.trialStart : 0, premium: true }));
  emit();
};

let syncing = false;
let started = false;

/** One-shot: after a sign-in that reloaded the page (web OAuth return or the
 * native handoff), send the user back to the feature they came from. */
const consumePostSignInReturn = (): void => {
  if (localStorage.getItem(POST_SIGNIN_RETURN_KEY) !== '1') return;
  localStorage.removeItem(POST_SIGNIN_RETURN_KEY);
  navigate(takeSignInReturn() ?? 'ritual');
};

/** Keeps Premium status in sync with the signed-in account. Call once at app start. */
export const initPremiumSync = () => {
  if (started) return;
  started = true;

  supabase.auth.getSession().then(({ data }) => {
    signedIn = Boolean(data.session?.user);
    signedInUserId = data.session?.user.id ?? null;
    emit();
    // The session can already exist when the page reloads right after sign-in
    // (OAuth return or native handoff), so the SIGNED_IN event never fires.
    if (signedIn) consumePostSignInReturn();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    signedInUserId = session?.user.id ?? null;
    const nowSignedIn = Boolean(session?.user);
    if (nowSignedIn !== signedIn) {
      signedIn = nowSignedIn;
      emit();
    }
    if (event === 'SIGNED_IN' && session?.user) {
      // A pending trial is finished (and navigated) by the Premium sync below.
      if (localStorage.getItem(PENDING_TRIAL_KEY) !== '1') consumePostSignInReturn();
    }
    if (!session?.user) {
      // Keep the last account's entitlement on this device after sign-out so
      // returning members are still recognized and never see the paywall again.
      void logOutBilling();
      return;
    }
    const userId = session.user.id;
    void initBilling(userId, markAccountPremium);
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
      // Sign-in loads access only. Native trials always require Apple's purchase sheet.
      const { data } = await supabase.from('entitlements').select('user_id, trial_started_at, premium').eq('user_id', userId).maybeSingle();
      if (signedInUserId !== userId) { syncing = false; return; }
      if (data) {
        const locallyConfirmed = readAccount();
        saveAccount({ ...data, premium: data.premium || Boolean(locallyConfirmed?.userId === userId && locallyConfirmed.premium) });
      }
      const ok = pending && !isNativeBilling() ? await startTrial() : false;
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
