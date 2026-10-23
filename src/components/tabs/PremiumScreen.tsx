import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sparkles, CheckCircle2, ArrowLeft, Loader2, Sun, Moon, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { hasUsedTrial, markAccountPremium, setPremiumUnlocked, startTrial, usePremium } from '@/lib/premium';
import { isNativeBilling, purchasePlan, restorePurchases, type BillingPlan } from '@/lib/billing';
import { DEFAULT_BILLING_PLAN, PENDING_PLAN_KEY, PREMIUM_PLANS_SEEN_KEY, getPurchaseDestination } from '@/lib/purchaseFlow';
import { setThemeMode, useTheme } from '@/lib/theme';
import { navigate } from '@/lib/nav';

const FEATURES = [
  'Guided Rituals to release stress',
  'All 6 calming breathing sounds',
  'Unlock every badge',
  'Complete laugh library',
];

export const PremiumScreen = () => {
  const premium = usePremium();
  const theme = useTheme();
  const native = isNativeBilling();
  const [plan, setPlan] = useState<BillingPlan>(() => localStorage.getItem(PENDING_PLAN_KEY) === 'monthly' ? 'monthly' : DEFAULT_BILLING_PLAN);
  const [busy, setBusy] = useState(false);
  // Remember that this device has seen the plans, so returning users skip
  // Explore Premium and go straight to the sign-in page next time.
  useEffect(() => {
    localStorage.setItem(PREMIUM_PLANS_SEEN_KEY, '1');
  }, []);

  const selectPlan = (next: BillingPlan) => {
    setPlan(next);
    localStorage.setItem(PENDING_PLAN_KEY, next);
  };

  const requireSignIn = () => {
    if (premium.signedIn) return false;
    localStorage.setItem(PENDING_PLAN_KEY, plan);
    toast('Sign in to continue with your selected plan');
    navigate('profile');
    return true;
  };

  const checkout = async () => {
    if (busy || requireSignIn()) return;
    setBusy(true);
    try {
      if (native) {
        const result = await purchasePlan(plan);
        if (!result.ok) {
          if (!result.cancelled) toast.error(result.error || 'Purchase could not be completed.');
          return;
        }
        markAccountPremium();
        toast.success('Welcome to Premium');
      } else {
        const ok = await startTrial();
        if (!ok) { toast.error('Could not start your preview trial. Please try again.'); return; }
        toast.success('7-day preview trial started');
      }
      localStorage.removeItem(PENDING_PLAN_KEY);
      navigate(getPurchaseDestination(true));
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (busy || requireSignIn()) return;
    setBusy(true);
    try {
      const result = await restorePurchases();
      if (result.ok) {
        markAccountPremium();
        toast.success('Premium restored');
        navigate('ritual');
      } else toast.error(result.error || 'Could not restore purchases.');
    } finally { setBusy(false); }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('ritual')} disabled={busy} className="text-muted-foreground px-0">
        <ArrowLeft /> Guided Rituals
      </Button>

      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground leading-snug">
          {premium.active ? 'Burn & Shed Premium' : 'Unlock Burn & Shed Premium'}
        </h2>
        <p className="text-sm text-muted-foreground">Make space for a calmer, more balanced you.</p>
      </div>

      <ul className="space-y-4">
        {FEATURES.map(feature => (
          <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> {feature}
          </li>
        ))}
      </ul>

      {premium.active ? (
        <div className="space-y-4">
          <p className="text-center text-sm font-semibold text-primary">
            {premium.source === 'trial' ? `Trial active — ${premium.trialDaysLeft} days left` : 'Premium active'}
          </p>
          <Button className="w-full h-12 font-bold" onClick={() => navigate('ritual')}>Continue to Guided Rituals</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div role="radiogroup" aria-label="Choose plan" className="space-y-3">
            {(['annual', 'monthly'] as const).map(option => (
              <Button
                key={option}
                variant="outline"
                role="radio"
                aria-checked={plan === option}
                aria-label={option === 'annual' ? 'Annual plan — $29.99 per year' : 'Monthly plan — $3.99 per month'}
                disabled={busy}
                onClick={() => selectPlan(option)}
                className={`w-full h-auto min-h-24 p-4 rounded-lg whitespace-normal text-left flex-col items-start gap-2 ${plan === option ? 'border-2 border-primary bg-primary/5' : 'border-border bg-card'}`}
              >
                {option === 'annual' && <span className="text-sm font-semibold text-primary">7-day free trial</span>}
                <span className="text-xl font-semibold text-foreground">{option === 'annual' ? '$29.99 / year' : '$3.99 / month'}</span>
                <span className="text-xs font-normal text-muted-foreground">{option === 'annual' ? 'About $2.50/month, billed annually' : 'Monthly subscription'}</span>
              </Button>
            ))}
          </div>
          <Button onClick={checkout} disabled={busy || (!native && premium.signedIn && hasUsedTrial())} className="w-full h-12 font-bold">
            {busy && <Loader2 className="animate-spin" />}
            {busy ? 'Please wait…' : native ? 'Start Free Trial' : hasUsedTrial() && premium.signedIn ? 'Preview trial already used' : 'Start 7-day preview trial'}
          </Button>
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            {native
              ? `7 days free for eligible new subscribers, then ${plan === 'annual' ? '$29.99/year' : '$3.99/month'}. Renews automatically unless cancelled. Apple confirms trial eligibility and the final price.`
              : 'Apple purchase confirmation is available in the installed iPhone app. This web trial does not start a paid subscription.'}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-2 text-xs text-muted-foreground">
            <span>Cancel anytime</span>
            {native && <><span aria-hidden="true">·</span><Button variant="link" size="sm" disabled={busy} onClick={restore} className="text-xs text-muted-foreground h-8 px-0"><RotateCcw /> Restore purchases</Button></>}
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild variant="link" size="sm" className="text-xs text-muted-foreground"><a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></Button>
            <Button asChild variant="link" size="sm" className="text-xs text-muted-foreground"><a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</a></Button>
          </div>
        </div>
      )}

      {premium.active && (
        <section className="space-y-3 border-t border-border pt-5">
          <h3 className="font-semibold text-foreground">Appearance</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['light', 'dark'] as const).map(mode => (
              <Button key={mode} variant={theme.mode === mode ? 'default' : 'outline'} onClick={() => setThemeMode(mode)} className="capitalize">
                {mode === 'light' ? <Sun /> : <Moon />} {mode}
              </Button>
            ))}
          </div>
        </section>
      )}

      {!native && (
        <div className="border-t border-dashed border-border pt-4 flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">Preview unlock</span>
          <Switch aria-label="Preview unlock" checked={premium.source === 'purchased'} onCheckedChange={checked => { setPremiumUnlocked(checked); if (checked && premium.signedIn) navigate('ritual'); }} />
        </div>
      )}
    </div>
  );
};