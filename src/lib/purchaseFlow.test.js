import { expect, test } from 'bun:test';
import { DEFAULT_BILLING_PLAN, findPlanPackage, getPurchaseDestination, hasPremiumAccess } from './purchaseFlow';

test('annual is the initially selected plan', () => {
  expect(DEFAULT_BILLING_PLAN).toBe('annual');
});

test('purchase uses the selected monthly or annual package, never the other plan', () => {
  const monthly = { identifier: '$rc_monthly' };
  const annual = { identifier: '$rc_annual' };
  expect(findPlanPackage('monthly', [annual, monthly])).toBe(monthly);
  expect(findPlanPackage('annual', [monthly, annual])).toBe(annual);
  expect(findPlanPackage('annual', [monthly])).toBeUndefined();
});

test('native sign-in and web trial alone do not grant Apple Premium', () => {
  expect(hasPremiumAccess(true, true, false, true, true)).toBe(false);
  expect(hasPremiumAccess(true, true, true, false, false)).toBe(true);
});

test('signed-out members cannot use Premium even with a paid entitlement', () => {
  expect(hasPremiumAccess(true, false, true, false, false)).toBe(false);
});

test('confirmed purchase returns to Rituals; cancellation stays on plan selection', () => {
  expect(getPurchaseDestination(true)).toBe('ritual');
  expect(getPurchaseDestination(false)).toBe('premium');
});