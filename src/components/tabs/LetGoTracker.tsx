import { useEffect, useState, useSyncExternalStore } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Medal,
  Star,
  Award,
  Flame,
  Scissors,
  Waves,
  Wind,
  Smile,
  Sparkles,
  HeartHandshake,
  User,
  ChevronRight,
} from 'lucide-react';
import { ActivitySnapshot, getActivitySnapshot, subscribeActivity } from '@/lib/activity';
import { navigate } from '@/lib/nav';
import { restorePurchases } from '@/lib/billing';
import { markAccountPremium } from '@/lib/premium';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, FileText, LifeBuoy, LogOut, RotateCcw, Shield, Trash2 } from 'lucide-react';

interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  progress: (s: ActivitySnapshot) => number;
  requirement: number;
}

const milestoneBadges: BadgeDef[] = [
  {
    id: 'first-release',
    name: 'First Release',
    description: 'Let go for the very first time',
    icon: Star,
    progress: s => s.releases,
    requirement: 1,
  },
  {
    id: 'finding-rhythm',
    name: 'Finding Your Rhythm',
    description: 'Let go 10 times',
    icon: Medal,
    progress: s => s.releases,
    requirement: 10,
  },
  {
    id: 'lighter-load',
    name: 'Lighter Load',
    description: 'Let go 25 times',
    icon: Award,
    progress: s => s.releases,
    requirement: 25,
  },
  {
    id: 'weightless',
    name: 'Weightless',
    description: 'Let go 100 times',
    icon: Trophy,
    progress: s => s.releases,
    requirement: 100,
  },
];

const featureBadges: BadgeDef[] = [
  {
    id: 'pyromancer',
    name: 'Pyromancer',
    description: 'Burn 20 notes to ashes',
    icon: Flame,
    progress: s => s.burn,
    requirement: 20,
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Wash 20 notes away',
    icon: Waves,
    progress: s => s.shed,
    requirement: 20,
  },
  {
    id: 'into-pieces',
    name: 'Into Pieces',
    description: 'Shred 20 notes',
    icon: Scissors,
    progress: s => s.shred,
    requirement: 20,
  },
  {
    id: 'deep-breather',
    name: 'Deep Breather',
    description: 'Finish 10 breathing resets',
    icon: Wind,
    progress: s => s.breathe,
    requirement: 10,
  },
  {
    id: 'good-medicine',
    name: 'Good Medicine',
    description: 'Enjoy 50 laughs',
    icon: Smile,
    progress: s => s.laugh,
    requirement: 50,
  },
  {
    id: 'ritual-keeper',
    name: 'Ritual Keeper',
    description: 'Complete 5 guided rituals',
    icon: HeartHandshake,
    progress: s => s.ritual,
    requirement: 5,
  },
  {
    id: 'full-toolkit',
    name: 'Full Toolkit',
    description: 'Try all five ways to let go',
    icon: Sparkles,
    progress: s =>
      [s.burn, s.shed, s.shred, s.breathe, s.laugh].filter(count => count > 0).length,
    requirement: 5,
  },
];

const Row = ({ icon: Icon, label, onClick, danger }: { icon: typeof Shield; label: string; onClick: () => void; danger?: boolean }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/60 transition-colors ${danger ? 'text-destructive' : 'text-foreground'}`}>
    <Icon size={18} />
    <span className="flex-1 text-sm font-medium">{label}</span>
    <ChevronRight size={16} className="text-muted-foreground" />
  </button>
);

export const LetGoTracker = () => {
  const stats = useSyncExternalStore(subscribeActivity, getActivitySnapshot, getActivitySnapshot);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const sync = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        const { data } = await supabase.from('profiles').select('display_name').eq('id', u.id).maybeSingle();
        const name = data?.display_name?.trim();
        setFirstName(name ? name.trim().split(/\s+/)[0].charAt(0).toUpperCase() + name.trim().split(/\s+/)[0].slice(1) : '');
      } else {
        setFirstName('');
      }
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { sync(); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  };

  const deleteAccount = async () => {
    const { error } = await supabase.functions.invoke('delete-account');
    if (error) return toast.error('Could not delete account. Please contact support.');
    await supabase.auth.signOut();
    setConfirmDelete(false);
    toast.success('Your account has been deleted');
  };

  const restore = async () => {
    const result = await restorePurchases();
    if (result.ok) {
      markAccountPremium();
      toast.success('Premium restored');
      navigate('ritual');
    } else if (!result.cancelled) {
      toast.error(result.error || 'Could not restore purchases.');
    }
  };

  const manageSubscription = () => {
    // Apple handles cancellation, plan changes and refunds — hand the user to their App Store subscriptions.
    window.open('https://apps.apple.com/account/subscriptions', '_blank');
  };


  const getStreakMessage = () => {
    if (stats.releases === 0) return 'Ready to start your journey?';
    if (stats.releases < 10) return 'Great start! Keep going.';
    if (stats.releases < 25) return "You're building a healthy habit!";
    if (stats.releases < 100) return 'Impressive dedication to wellness!';
    return "You're a master of letting go!";
  };

  const monthlyMessage = () => {
    const n = stats.month.releases;
    if (n === 0) return 'A fresh month is waiting for you.';
    if (n === 1) return 'You gave yourself 1 chance to let go.';
    return `You gave yourself ${n} chances to let go.`;
  };

  const renderBadge = (badge: BadgeDef) => {
    const Icon = badge.icon;
    const current = Math.min(badge.progress(stats), badge.requirement);
    const earned = current >= badge.requirement;

    return (
      <Card
        key={badge.id}
        className={`p-5 border transition-all duration-300 rounded-2xl ${
          earned
            ? 'bg-gradient-success text-white border-success/30 shadow-success hover:shadow-large hover:scale-[1.02]'
            : 'bg-muted/50 border-border/50 opacity-80 hover:opacity-100'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${earned ? 'bg-white/20' : 'bg-muted'}`}>
            <Icon className={`h-7 w-7 ${earned ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-bold text-base ${earned ? 'text-white' : 'text-foreground'}`}>
                {badge.name}
              </h4>
              {earned && (
                <Badge variant="secondary" className="text-xs font-bold">
                  ✓ Earned
                </Badge>
              )}
            </div>
            <p className={`text-sm font-medium ${earned ? 'text-white/90' : 'text-muted-foreground'}`}>
              {badge.description}
            </p>
            {!earned && (
              <div className="mt-3 space-y-1.5">
                <Progress value={(current / badge.requirement) * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground font-medium">
                  {current}/{badge.requirement}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto animate-float shadow-success">
          <Trophy className="h-10 w-10 text-white drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          {firstName ? `Welcome, ${firstName}` : 'Welcome'}
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          Celebrate your progress and mental wellness journey
        </p>
      </div>

      <div className="space-y-5">
        <Card className="p-8 bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-large rounded-2xl">
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold text-primary tracking-tight">{stats.releases}</div>
            <div className="text-xl font-bold text-foreground">Total Releases</div>
            <div className="text-base text-muted-foreground font-medium">{getStreakMessage()}</div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 bg-gradient-to-br from-fire/5 to-fire/10 border-fire/20 shadow-medium rounded-2xl transition-all duration-300 hover:shadow-fire hover:scale-105">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-fire">{stats.burn}</div>
              <div className="text-sm font-bold text-foreground">Burned</div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-medium rounded-2xl transition-all duration-300 hover:shadow-primary hover:scale-105">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{stats.shed}</div>
              <div className="text-sm font-bold text-foreground">Shed Away</div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-medium rounded-2xl transition-all duration-300 hover:shadow-primary hover:scale-105">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{stats.shred}</div>
              <div className="text-sm font-bold text-foreground">Shredded</div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-muted/40 to-muted/10 border-border/50 shadow-medium rounded-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-foreground">{stats.breathe}</div>
              <div className="text-sm font-bold text-foreground">Breathing</div>
            </div>
          </Card>

          <Card className="col-span-2 p-5 bg-gradient-to-br from-muted/40 to-muted/10 border-border/50 shadow-medium rounded-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-foreground">{stats.laugh}</div>
              <div className="text-sm font-bold text-foreground">Laughs</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Milestones</h3>
        <div className="grid grid-cols-1 gap-4">{milestoneBadges.map(renderBadge)}</div>
      </div>

      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Explorer Badges</h3>
        <div className="grid grid-cols-1 gap-4">{featureBadges.map(renderBadge)}</div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Monthly Summary</h3>
        {stats.months.map((entry, index) => (
          <Card key={entry.key} className="p-5 border-border/50 shadow-medium rounded-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-primary">{entry.counts.releases}</div>
              <div className="text-sm font-bold text-foreground">
                {index === 0 ? `This Month (${entry.label})` : entry.label}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                ['Burned', entry.counts.burn],
                ['Shed', entry.counts.shed],
                ['Shredded', entry.counts.shred],
                ['Breaths', entry.counts.breathe],
                ['Laughs', entry.counts.laugh],
              ].map(([label, n]) => (
                <div key={label as string}>
                  <div className="text-xl font-bold text-foreground">{n}</div>
                  <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            {index === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Resets on the 1st of each month. Only the last 3 months are shown — your All Time totals above never reset.
              </p>
            )}
          </Card>
        ))}
        <p className="text-center text-base text-primary font-semibold leading-relaxed px-4">
          {monthlyMessage()}
        </p>
      </div>


      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Account</h3>
        <div className="rounded-2xl border border-border bg-card shadow-soft divide-y divide-border overflow-hidden">
          {user ? (
            <>
              <Row icon={CreditCard} label="Manage subscription" onClick={manageSubscription} />
              <Row icon={RotateCcw} label="Restore purchases" onClick={restore} />
              <Row icon={Shield} label="Privacy Policy" onClick={() => window.open('/privacy', '_blank')} />
              <Row icon={FileText} label="Terms of Use" onClick={() => window.open('/terms', '_blank')} />
              <Row icon={LifeBuoy} label="Contact support" onClick={() => (window.location.href = 'mailto:support@burnandshed.com')} />
              <Row icon={LogOut} label="Sign out" onClick={signOut} />
              <Row icon={Trash2} label="Delete account" onClick={() => setConfirmDelete(true)} danger />
            </>
          ) : (
            <Row icon={User} label="Sign in" onClick={() => navigate('profile')} />
          )}
        </div>

        {confirmDelete && user && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 space-y-3">
            <p className="text-sm">This permanently deletes your account and profile. Subscriptions must be cancelled separately in your Apple ID settings.</p>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted/60" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="flex-1 rounded-xl bg-destructive py-2 text-sm font-medium text-white" onClick={deleteAccount}>Delete forever</button>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground font-medium">
          🌟 Badges are yours forever
        </p>
      </div>
    </div>
  );
};
