import { useSyncExternalStore } from 'react';
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
} from 'lucide-react';
import { ActivitySnapshot, getActivitySnapshot, subscribeActivity } from '@/lib/activity';

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

export const LetGoTracker = () => {
  const stats = useSyncExternalStore(subscribeActivity, getActivitySnapshot, getActivitySnapshot);

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
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Let Go Tracker</h2>
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
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          This Month{' '}
          <span className="text-sm font-medium text-muted-foreground">
            ({new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' })})
          </span>
        </h3>
        <Card className="p-5 border-border/50 shadow-medium rounded-2xl">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-primary">{stats.month.releases}</div>
            <div className="text-sm font-bold text-foreground">Releases this month</div>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              ['Burned', stats.month.burn],
              ['Shed', stats.month.shed],
              ['Shredded', stats.month.shred],
              ['Breaths', stats.month.breathe],
              ['Laughs', stats.month.laugh],
            ].map(([label, n]) => (
              <div key={label as string}>
                <div className="text-xl font-bold text-foreground">{n}</div>
                <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">Resets on the 1st of each month. Lifetime totals above never reset.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Milestones</h3>
        <div className="grid grid-cols-1 gap-4">{milestoneBadges.map(renderBadge)}</div>
      </div>

      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Explorer Badges</h3>
        <div className="grid grid-cols-1 gap-4">{featureBadges.map(renderBadge)}</div>
      </div>

      <div className="text-center mt-auto pt-4">
        <p className="text-sm text-muted-foreground font-medium">
          🌟 Badges are yours forever
        </p>
      </div>
    </div>
  );
};
