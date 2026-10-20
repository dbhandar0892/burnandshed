export type BillingPlan = 'monthly' | 'annual';

export const DEFAULT_BILLING_PLAN: BillingPlan = 'annual';
export const PENDING_PLAN_KEY = 'bs_pending_billing_plan';

/** Never substitute another subscription if the chosen plan is unavailable. */
export const findPlanPackage = <T extends { identifier: string }>(plan: BillingPlan, packages: T[]): T | undefined =>
  packages.find(pkg => pkg.identifier === (plan === 'annual' ? '$rc_annual' : '$rc_monthly'));

/** Native trials require a store-confirmed entitlement, not a web preview trial. */
export const hasPremiumAccess = (native: boolean, signedIn: boolean, accountPremium: boolean, previewUnlocked: boolean, trialActive: boolean) =>
  signedIn && (accountPremium || (!native && (previewUnlocked || trialActive)));

export const getPurchaseDestination = (confirmed: boolean) => confirmed ? 'ritual' as const : 'premium' as const;