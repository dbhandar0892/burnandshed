import { Droplets, Scissors, Flame, Laugh, Wind, Trophy, Sparkles } from 'lucide-react';
import { ShedIt } from './tabs/ShedIt';
import { VentBox } from './tabs/VentBox';
import { BurnNote } from './tabs/BurnNote';
import { LaughBreak } from './tabs/LaughBreak';
import { BreathingReset } from './tabs/BreathingReset';
import { LetGoTracker } from './tabs/LetGoTracker';
import { Rituals } from './tabs/Rituals';
import { PremiumScreen } from './tabs/PremiumScreen';
import { withPremium } from './PremiumGate';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { setPremiumUnlocked } from '@/lib/premium';
import { navigate, useView, ViewId } from '@/lib/nav';
import { useEffect, useRef } from 'react';
import { getActivitySnapshot, subscribeActivity } from '@/lib/activity';
import { completeRitualRelease, getPendingRitualRelease, getRitualReleaseDuration } from '@/lib/ritualFlow';
import logo from '../assets/burn-and-shed-logo.webp';

const tabs: { id: ViewId; icon: typeof Flame; label: string; component: () => JSX.Element }[] = [
  { id: 'burn', icon: Flame, label: 'Burn It', component: BurnNote },
  { id: 'shed', icon: Droplets, label: 'Shed It', component: ShedIt },
  { id: 'shred', icon: Scissors, label: 'Shred It', component: VentBox },
  { id: 'ritual', icon: Sparkles, label: 'Ritual', component: Rituals },
  { id: 'laugh', icon: Laugh, label: 'Laugh', component: withPremium(LaughBreak, 'Laugh Break', 'Laugh is a Premium feature', '100 hand-picked jokes to lighten the moment.') },
  { id: 'breathe', icon: Wind, label: 'Breathe', component: withPremium(BreathingReset, 'Breathe', 'Breathe is a Premium feature', 'Guided breathing with six calming soundscapes.') },
  { id: 'tracker', icon: Trophy, label: 'Tracker', component: withPremium(LetGoTracker, 'Let Go Tracker', 'Tracker is a Premium feature', 'See your counts, badges, and monthly summary.') },
];

export const MobileLayout = () => {
  const activeTab = useView();
  const returnTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let previous = getActivitySnapshot();
    const unsubscribe = subscribeActivity(() => {
      const current = getActivitySnapshot();
      const pending = getPendingRitualRelease();
      if (pending && current[pending.type] > previous[pending.type] && returnTimerRef.current === null) {
        returnTimerRef.current = window.setTimeout(() => {
          completeRitualRelease();
          navigate('ritual');
          returnTimerRef.current = null;
        }, getRitualReleaseDuration(pending));
      }
      previous = current;
    });
    return () => {
      unsubscribe();
      if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    };
  }, []);

  const ActiveComponent =
    activeTab === 'premium'
      ? PremiumScreen
      : tabs.find(tab => tab.id === activeTab)?.component || BurnNote;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto shadow-large">
      {/* Header with enhanced gradient and depth */}
      <header className="bg-gradient-calm px-6 py-5 text-center shadow-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh-calm opacity-40" />

        <div className="relative z-10 flex flex-col items-center">
          <img
            src={logo}
            alt="Burn & Shed"
            className="h-[7.5rem] w-auto max-w-full object-contain drop-shadow-sm"
          />
          <p className="logo-tagline mt-2 text-[11px] font-bold">Let go and feel better</p>
        </div>
        {!Capacitor.isNativePlatform() && (
          <button
            onClick={() => {
              localStorage.removeItem('premiumTrialStart');
              setPremiumUnlocked(false);
              toast.success('Premium reset — you now see the free version');
            }}
            className="absolute top-2 right-2 z-20 text-[10px] font-semibold px-2 py-1 rounded-full bg-card/80 text-muted-foreground border border-border hover:text-foreground"
          >
            Reset Premium
          </button>
        )}
      </header>

      {/* Main Content with smooth transitions */}
      <main className="flex-1 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="h-full animate-fade-in">
          <ActiveComponent />
        </div>
      </main>

      {/* Bottom Navigation with modern design */}
      <nav className="bg-card/80 backdrop-blur-lg border-t border-border/50 p-2 shadow-large">
        <div className="flex justify-between items-center gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-300 flex-1 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-primary scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:scale-105'
                }`}
              >
                <Icon size={20} className={isActive ? 'animate-float' : ''} />
                <span className="text-[9px] mt-1 font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
