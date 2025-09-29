import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

export const BreathingReset = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [breathePhase, setBreathePhase] = useState<'in' | 'out'>('in');
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Breathing cycle (4 seconds in, 4 seconds out)
  useEffect(() => {
    let phaseInterval: NodeJS.Timeout;

    if (isActive) {
      phaseInterval = setInterval(() => {
        setBreathePhase(prev => {
          if (prev === 'in') {
            return 'out';
          } else {
            setCycleCount(count => count + 1);
            return 'in';
          }
        });
      }, 4000);
    }

    return () => clearInterval(phaseInterval);
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(60);
    setBreathePhase('in');
    setCycleCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-zen rounded-full flex items-center justify-center mx-auto animate-float">
          <Wind className="h-8 w-8 text-zen-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">1-Min Reset</h2>
        <p className="text-muted-foreground">Focus on your breath and find your center</p>
      </div>

      {/* Breathing Circle */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-8 bg-card border-border shadow-medium w-full max-w-sm mx-auto">
          <div className="text-center space-y-6">
            {/* Animated Circle */}
            <div className="relative flex items-center justify-center">
              <div 
                className={`w-32 h-32 rounded-full bg-gradient-zen flex items-center justify-center transition-all duration-[4000ms] ${
                  isActive ? 'animate-breathe' : ''
                }`}
              >
                <div className="text-zen-foreground font-bold text-lg">
                  {isActive ? (breathePhase === 'in' ? 'Breathe In' : 'Breathe Out') : 'Ready'}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground">
                Breathing cycles: {cycleCount}
              </div>
            </div>

            {/* Instructions */}
            {isActive && (
              <div className="text-sm text-muted-foreground">
                {breathePhase === 'in' ? 'Inhale slowly through your nose' : 'Exhale gently through your mouth'}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex gap-3">
          {!isActive ? (
            <Button
              onClick={handleStart}
              disabled={timeLeft === 0}
              className="flex-1 bg-gradient-zen text-zen-foreground hover:opacity-90 h-12 text-lg font-semibold rounded-lg shadow-soft"
            >
              <Play className="mr-2 h-5 w-5" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 text-lg font-semibold rounded-lg shadow-soft"
            >
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-12 px-6 rounded-lg shadow-soft"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🧘‍♀️ Focus on the rhythm. Let each breath calm your mind.
          </p>
        </div>
      </div>
    </div>
  );
};