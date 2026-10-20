import { Capacitor } from '@capacitor/core';
import { Purchases, type CustomerInfo, type PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { findPlanPackage, type BillingPlan } from './purchaseFlow';
export type { BillingPlan } from './purchaseFlow';

/**
 * RevenueCat public SDK keys — publishable, safe to keep in code.
 * - TEST key ("test_..."): RevenueCat Test Store, for development testing only.
 *   It cannot process real App Store purchases.
 * - APPLE key ("appl_..."): the real iOS app key from the RevenueCat dashboard
 *   (Project → Apps → Burn & Shed iOS → public SDK key). Required for release.
 */
export const REVENUECAT_TEST_API_KEY = 'test_ezaikWKHdqoePlfMxLvMlvhbadq';
export const REVENUECAT_API_KEY = 'appl_REPLACE_WITH_REVENUECAT_SDK_KEY';

/** Entitlement identifier configured in RevenueCat; covers both plans. */
const ENTITLEMENT_ID = 'premium';

export interface PurchaseResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

/** Real store billing only exists inside the installed iOS/Android app. */
export const isNativeBilling = () => Capacitor.isNativePlatform();

const hasAppleKey = () => REVENUECAT_API_KEY.startsWith('appl_') && !REVENUECAT_API_KEY.includes('REPLACE');

/** Key to configure with: real Apple key when present, Test Store key otherwise. */
const activeKey = () => (hasAppleKey() ? REVENUECAT_API_KEY : REVENUECAT_TEST_API_KEY);

const hasKey = () => Boolean(activeKey());

const isPremiumActive = (info: CustomerInfo) => Boolean(info.entitlements.active[ENTITLEMENT_ID]);
let billingReady: Promise<void> | null = null;
let billingUserId: string | null = null;
let premiumCallback: (() => void) | null = null;
let listening = false;

/**
 * Configures RevenueCat for the signed-in account and starts listening for
 * entitlement changes. `onPremiumGranted` fires whenever the store confirms
 * an active subscription (purchase, restore, renewal, or webhook refresh).
 */
export const initBilling = async (userId: string, onPremiumGranted: () => void) => {
  if (!isNativeBilling() || !hasKey()) return;
  premiumCallback = onPremiumGranted;
  if (billingUserId !== userId || !billingReady) {
    const previous = billingReady;
    billingUserId = userId;
    billingReady = (async () => {
      await previous?.catch(() => undefined);
      await Purchases.configure({ apiKey: activeKey(), appUserID: userId });
      if (!listening) {
        await Purchases.addCustomerInfoUpdateListener(info => {
          if (info.originalAppUserId === billingUserId && isPremiumActive(info)) premiumCallback?.();
        });
        listening = true;
      }
      const { customerInfo } = await Purchases.getCustomerInfo();
      if (billingUserId === userId && isPremiumActive(customerInfo)) premiumCallback?.();
    })();
  }
  try {
    await billingReady;
  } catch (e) {
    console.warn('Billing init failed', e);
  }
};

/** Detaches the store from the account on sign-out. */
export const logOutBilling = async () => {
  if (!isNativeBilling() || !hasKey()) return;
  const pending = billingReady;
  billingUserId = null;
  premiumCallback = null;
  billingReady = null;
  try {
    await pending;
    await Purchases.logOut();
  } catch {
    // not configured yet — nothing to do
  }
};

const findPackage = (plan: BillingPlan, packages: PurchasesPackage[]): PurchasesPackage | undefined => {
  return findPlanPackage(plan, packages);
};

/**
 * Opens Apple's purchase sheet for the chosen plan. The 7-day free trial is
 * applied automatically by Apple as the product's introductory offer.
 */
export const purchasePlan = async (plan: BillingPlan): Promise<PurchaseResult> => {
  if (!isNativeBilling() || !hasKey()) return { ok: false, error: 'Store billing is only available in the installed app.' };
  try {
    if (!billingReady || !billingUserId) return { ok: false, error: 'Please sign in before choosing a subscription.' };
    await billingReady;
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current || current.availablePackages.length === 0) {
      return { ok: false, error: 'No subscription plans are available yet. Please try again later.' };
    }
    const pkg = findPackage(plan, current.availablePackages);
    if (!pkg) return { ok: false, error: 'Plan not found.' };
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return isPremiumActive(customerInfo) ? { ok: true } : { ok: false, error: 'Purchase did not activate Premium.' };
  } catch (e) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, error: err.message || 'Purchase failed. Please try again.' };
  }
};

/** Restores previous purchases made with this Apple ID. */
export const restorePurchases = async (): Promise<PurchaseResult> => {
  if (!isNativeBilling() || !hasKey()) return { ok: false, error: 'Restore is only available in the installed app.' };
  try {
    if (!billingReady || !billingUserId) return { ok: false, error: 'Please sign in before restoring purchases.' };
    await billingReady;
    const { customerInfo } = await Purchases.restorePurchases();
    return isPremiumActive(customerInfo)
      ? { ok: true }
      : { ok: false, error: 'No active subscription found for this Apple ID.' };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Restore failed. Please try again.' };
  }
};
