import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Award } from 'lucide-react';

interface Stats {
  shredCount: number;
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
  const [stats, setStats] = useState<Stats>({ shredCount: 0, burnCount: 0, totalCount: 0 });

  useEffect(() => {
    const shredCount = parseInt(localStorage.getItem('shredCount') || '0');
    const burnCount = parseInt(localStorage.getItem('burnCount') || '0');
    const totalCount = shredCount + burnCount;
    
    setStats({ shredCount, burnCount, totalCount });
  }, []);

  // Refresh stats every few seconds to catch updates
  useEffect(() => {
    const interval = setInterval(() => {
      const shredCount = parseInt(localStorage.getItem('shredCount') || '0');
      const burnCount = parseInt(localStorage.getItem('burnCount') || '0');
      const totalCount = shredCount + burnCount;
      
      setStats({ shredCount, burnCount, totalCount });
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
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto animate-float">
          <Trophy className="h-8 w-8 text-success-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Let Go Tracker</h2>
        <p className="text-muted-foreground">Celebrate your progress and mental wellness journey</p>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        <Card className="p-6 bg-card border-border shadow-soft">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">{stats.totalCount}</div>
            <div className="text-lg font-semibold text-foreground">Total Releases</div>
            <div className="text-sm text-muted-foreground">{getStreakMessage()}</div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card border-border shadow-soft">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{stats.shredCount}</div>
              <div className="text-sm font-medium text-foreground">Shredded</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-card border-border shadow-soft">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-fire">{stats.burnCount}</div>
              <div className="text-sm font-medium text-foreground">Burned</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Badges */}
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Achievement Badges</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card 
                key={badge.id} 
                className={`p-4 border transition-all ${
                  badge.earned 
                    ? 'bg-gradient-success text-success-foreground border-success shadow-soft' 
                    : 'bg-muted border-border opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-8 w-8 ${badge.earned ? 'text-success-foreground' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold ${badge.earned ? 'text-success-foreground' : 'text-foreground'}`}>
                        {badge.name}
                      </h4>
                      {badge.earned && (
                        <Badge variant="secondary" className="text-xs">
                          Earned!
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${badge.earned ? 'text-success-foreground/80' : 'text-muted-foreground'}`}>
                      {badge.description}
                    </p>
                    {!badge.earned && (
                      <p className="text-xs text-muted-foreground mt-1">
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
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🌟 Every release is a step towards emotional freedom
        </p>
      </div>
    </div>
  );
};