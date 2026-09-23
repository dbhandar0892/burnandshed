import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Check, Sun, Moon, Palette as PaletteIcon, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  hasUsedTrial,
  setPremiumUnlocked,
  startTrial,
  TRIAL_LENGTH_DAYS,
  usePremium,
} from '@/lib/premium';
import { PALETTES, setPalette, setThemeMode, useTheme } from '@/lib/theme';

const PREMIUM_FEATURES = [
  'All 6 breathing sounds — Ambient, Ocean, Rain, Fire, Forest, Deep Hum',
  'Guided Rituals — step-by-step release sessions',
  'All milestone and explorer badges in the tracker',
  'Dark mode and colour themes',
  'No ads, ever',
];

const FREE_FEATURES = [
  'Burn It, Shed It and Shred It — unlimited, full effects',
  'All 100 jokes',
  'Breathing reset with the Ambient sound',
  'Total releases and the weekly challenge',
];

export const PremiumScreen = () => {
  const premium = usePremium();
  const theme = useTheme();

  return (
    <div className="h-full overflow-y-auto p-6 space-y-7">
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-calm rounded-2xl flex items-center justify-center mx-auto animate-float shadow-primary">
          <Sparkles className="h-10 w-10 text-white drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Burn &amp; Shed Premium</h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          The release moment is always free. Premium adds the depth around it.
        </p>
        {premium.active && (
          <Badge className="text-xs font-bold">
            {premium.source === 'trial'
              ? `Trial active — ${premium.trialDaysLeft} day${premium.trialDaysLeft === 1 ? '' : 's'} left`
              : 'Premium active'}
          </Badge>
        )}
      </div>

      {!premium.active && (
        <Card className="p-6 rounded-2xl border-primary/25 bg-gradient-to-br from-primary/10 to-card shadow-large space-y-5">
          <div className="text-center space-y-1">
            <div className="text-4xl font-bold text-primary tracking-tight">$3.99</div>
            <div className="text-sm font-semibold text-muted-foreground">per month</div>
            <div className="text-sm font-medium text-foreground pt-2">
              or $29.99 a year — about $2.50 a month
            </div>
          </div>
          <Button
            onClick={() => {
              startTrial();
              toast.success(`${TRIAL_LENGTH_DAYS}-day free trial started`);
            }}
            disabled={hasUsedTrial()}
            className="w-full h-14 rounded-2xl bg-gradient-calm text-white text-lg font-bold shadow-primary hover:opacity-90"
          >
            {hasUsedTrial() ? 'Trial already used' : `Start ${TRIAL_LENGTH_DAYS}-day free trial`}
          </Button>
          <p className="text-xs text-center text-muted-foreground font-medium">
            Cancel any time. Billing is not connected yet — this is a preview of the plan.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">What Premium unlocks</h3>
        <Card className="p-5 rounded-2xl shadow-medium space-y-3">
          {PREMIUM_FEATURES.map(f => (
            <div key={f} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground">{f}</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Always free</h3>
        <Card className="p-5 rounded-2xl bg-muted/40 border-border/50 space-y-3">
          {FREE_FEATURES.map(f => (
            <div key={f} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-muted-foreground">{f}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PaletteIcon className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground tracking-tight">Appearance</h3>
          {!premium.active && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>

        <Card className={`p-5 rounded-2xl shadow-medium space-y-5 ${premium.active ? '' : 'opacity-60'}`}>
          <div className="grid grid-cols-2 gap-3">
            {(['light', 'dark'] as const).map(mode => {
              const Icon = mode === 'light' ? Sun : Moon;
              const selected = theme.mode === mode && premium.active;
              return (
                <button
                  key={mode}
                  disabled={!premium.active}
                  onClick={() => setThemeMode(mode)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold capitalize transition-all duration-300 ${
                    selected
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-card/60 border-border text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {mode}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {PALETTES.map(p => {
              const selected = theme.palette === p.id && premium.active;
              return (
                <button
                  key={p.id}
                  disabled={!premium.active}
                  onClick={() => setPalette(p.id)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all duration-300 ${
                    selected ? 'border-primary bg-primary/10' : 'border-border bg-card/60'
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-full shadow-soft"
                    style={{ background: p.swatch }}
                  />
                  <span className="text-[11px] font-semibold text-muted-foreground">{p.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {!premium.active && (
          <p className="text-xs text-center text-muted-foreground font-medium">
            Dark mode and colour themes unlock with Premium.
          </p>
        )}
      </div>

      {/* Preview unlock — stands in for real billing */}
      <Card className="p-5 rounded-2xl border-dashed border-border/70 bg-muted/30 flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm text-foreground">Preview unlock</div>
          <p className="text-xs text-muted-foreground font-medium">
            Turn Premium on to try everything while billing is not connected.
          </p>
        </div>
        <Switch
          checked={premium.source === 'purchased'}
          onCheckedChange={checked => setPremiumUnlocked(checked)}
        />
      </Card>
    </div>
  );
};
