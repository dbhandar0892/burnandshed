import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// Speech synthesis helper
const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slightly slower for calmness
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }
};

export const BreathingReset = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [breathePhase, setBreathePhase] = useState<'in' | 'out'>('in');
  const [cycleCount, setCycleCount] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const hasSpokenRef = useRef(false);

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
      // Speak the initial phase when starting
      if (voiceEnabled && !hasSpokenRef.current) {
        speak('Breathe in');
        hasSpokenRef.current = true;
      }

      phaseInterval = setInterval(() => {
        setBreathePhase(prev => {
          const nextPhase = prev === 'in' ? 'out' : 'in';
          
          // Speak the next phase
          if (voiceEnabled) {
            speak(nextPhase === 'in' ? 'Breathe in' : 'Breathe out');
          }
          
          if (prev === 'out') {
            setCycleCount(count => count + 1);
          }
          
          return nextPhase;
        });
      }, 4000);
    } else {
      hasSpokenRef.current = false;
    }

    return () => {
      clearInterval(phaseInterval);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isActive, voiceEnabled]);

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
    hasSpokenRef.current = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(prev => !prev);
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
            onClick={toggleVoice}
            variant="outline"
            className="h-12 px-6 rounded-lg shadow-soft"
            title={voiceEnabled ? "Disable voice guide" : "Enable voice guide"}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          
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