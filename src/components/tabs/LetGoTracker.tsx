import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Award } from 'lucide-react';

interface Stats {
  shedCount: number;
  burnCount: number;
  totalCount: number;
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requirement: number;
  earned: boolean;
}

export const LetGoTracker = () => {
  const [stats, setStats] = useState<Stats>({ shedCount: 0, burnCount: 0, totalCount: 0 });

  useEffect(() => {
    const shedCount = parseInt(localStorage.getItem('shedCount') || '0');
    const burnCount = parseInt(localStorage.getItem('burnCount') || '0');
    const totalCount = shedCount + burnCount;
    
    setStats({ shedCount, burnCount, totalCount });
  }, []);

  // Refresh stats every few seconds to catch updates
  useEffect(() => {
    const interval = setInterval(() => {
      const shedCount = parseInt(localStorage.getItem('shedCount') || '0');
      const burnCount = parseInt(localStorage.getItem('burnCount') || '0');
      const totalCount = shedCount + burnCount;
      
      setStats({ shedCount, burnCount, totalCount });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const badges: BadgeData[] = [
    {
      id: 'first-step',
      name: 'First Step',
      description: 'Let go for the first time',
      icon: Star,
      requirement: 1,
      earned: stats.totalCount >= 1,
    },
    {
      id: 'zen-starter',
      name: 'Zen Starter',
      description: 'Let go 5 times',
      icon: Medal,
      requirement: 5,
      earned: stats.totalCount >= 5,
    },
    {
      id: 'release-master',
      name: 'Release Master',
      description: 'Let go 15 times',
      icon: Award,
      requirement: 15,
      earned: stats.totalCount >= 15,
    },
    {
      id: 'let-go-pro',
      name: 'Let Go Pro',
      description: 'Let go 50 times',
      icon: Trophy,
      requirement: 50,
      earned: stats.totalCount >= 50,
    },
  ];

  const getStreakMessage = () => {
    if (stats.totalCount === 0) return "Ready to start your journey?";
    if (stats.totalCount < 5) return "Great start! Keep going.";
    if (stats.totalCount < 15) return "You're building a healthy habit!";
    if (stats.totalCount < 50) return "Impressive dedication to wellness!";
    return "You're a master of letting go!";
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      {/* Header with enhanced styling */}
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto animate-float shadow-success">
          <Trophy className="h-10 w-10 text-white drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Let Go Tracker</h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          Celebrate your progress and mental wellness journey
        </p>
      </div>

      {/* Stats Cards with enhanced design */}
      <div className="space-y-5">
        <Card className="p-8 bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-large rounded-2xl">
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold text-primary tracking-tight">{stats.totalCount}</div>
            <div className="text-xl font-bold text-foreground">Total Releases</div>
            <div className="text-base text-muted-foreground font-medium">{getStreakMessage()}</div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-medium rounded-2xl transition-all duration-300 hover:shadow-primary hover:scale-105">
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold text-primary">{stats.shedCount}</div>
              <div className="text-sm font-bold text-foreground">Shed</div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-fire/5 to-fire/10 border-fire/20 shadow-medium rounded-2xl transition-all duration-300 hover:shadow-fire hover:scale-105">
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold text-fire">{stats.burnCount}</div>
              <div className="text-sm font-bold text-foreground">Burned</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Badges with enhanced design */}
      <div className="flex-1 space-y-5">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Achievement Badges</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card 
                key={badge.id} 
                className={`p-5 border transition-all duration-300 rounded-2xl ${
                  badge.earned 
                    ? 'bg-gradient-success text-white border-success/30 shadow-success hover:shadow-large hover:scale-[1.02]' 
                    : 'bg-muted/50 border-border/50 opacity-70 hover:opacity-90'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${badge.earned ? 'bg-white/20' : 'bg-muted'}`}>
                    <Icon className={`h-8 w-8 ${badge.earned ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-bold text-base ${badge.earned ? 'text-white' : 'text-foreground'}`}>
                        {badge.name}
                      </h4>
                      {badge.earned && (
                        <Badge variant="secondary" className="text-xs font-bold">
                          ✓ Earned!
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm font-medium ${badge.earned ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {badge.description}
                    </p>
                    {!badge.earned && (
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        Progress: {stats.totalCount}/{badge.requirement}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Encouragement */}
      <div className="text-center mt-auto pt-4">
        <p className="text-sm text-muted-foreground font-medium">
          🌟 Every release is a step towards emotional freedom
        </p>
      </div>
    </div>
  );
};