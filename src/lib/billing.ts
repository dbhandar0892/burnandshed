import { Capacitor } from '@capacitor/core';
import { Purchases, type CustomerInfo, type PurchasesPackage } from '@revenuecat/purchases-capacitor';

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

export type BillingPlan = 'monthly' | 'annual';

export interface PurchaseResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

/** Real store billing only exists inside the installed iOS/Android app. */
export const isNativeBilling = () => Capacitor.isNativePlatform();

const hasKey = () => REVENUECAT_API_KEY.startsWith('appl_') && !REVENUECAT_API_KEY.includes('REPLACE');

const isPremiumActive = (info: CustomerInfo) => Boolean(info.entitlements.active[ENTITLEMENT_ID]);

/**
 * Configures RevenueCat for the signed-in account and starts listening for
 * entitlement changes. `onPremiumGranted` fires whenever the store confirms
 * an active subscription (purchase, restore, renewal, or webhook refresh).
 */
export const initBilling = async (userId: string, onPremiumGranted: () => void) => {
  if (!isNativeBilling() || !hasKey()) return;
  try {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
    Purchases.addCustomerInfoUpdateListener(info => {
      if (isPremiumActive(info)) onPremiumGranted();
    });
    const { customerInfo } = await Purchases.getCustomerInfo();
    if (isPremiumActive(customerInfo)) onPremiumGranted();
  } catch (e) {
    console.warn('Billing init failed', e);
  }
};

/** Detaches the store from the account on sign-out. */
export const logOutBilling = async () => {
  if (!isNativeBilling() || !hasKey()) return;
  try {
    await Purchases.logOut();
  } catch {
    // not configured yet — nothing to do
  }
};

const findPackage = (plan: BillingPlan, packages: PurchasesPackage[]): PurchasesPackage | undefined => {
  const id = plan === 'annual' ? '$rc_annual' : '$rc_monthly';
  return packages.find(p => p.identifier === id) ?? packages[plan === 'annual' ? 1 : 0] ?? packages[0];
};

/**
 * Opens Apple's purchase sheet for the chosen plan. The 7-day free trial is
 * applied automatically by Apple as the product's introductory offer.
 */
export const purchasePlan = async (plan: BillingPlan): Promise<PurchaseResult> => {
  if (!isNativeBilling() || !hasKey()) return { ok: false, error: 'Store billing is only available in the installed app.' };
  try {
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
    const { customerInfo } = await Purchases.restorePurchases();
    return isPremiumActive(customerInfo)
      ? { ok: true }
      : { ok: false, error: 'No active subscription found for this Apple ID.' };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Restore failed. Please try again.' };
  }
};
