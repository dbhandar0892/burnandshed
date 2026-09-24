import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { logActivity } from '@/lib/activity';
import { usePremium } from '@/lib/premium';
import { navigate } from '@/lib/nav';
import { Lock } from 'lucide-react';
import { BASE_GAIN, SOUNDS, SoundHandle, SoundId, createSoundscape, stopSoundscape } from '@/lib/soundscapes';

export const BreathingReset = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [breathePhase, setBreathePhase] = useState<'in' | 'out'>('in');
  const [cycleCount, setCycleCount] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const premium = usePremium();
  const [soundChoice, setSoundChoice] = useState<SoundId>('pad');
  const sound: SoundId = premium.active ? soundChoice : 'pad';
  const [volume, setVolume] = useState(0.7);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundHandleRef = useRef<SoundHandle | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isActive) logActivity('breathe');
      setIsActive(false);
    }

    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Soundscape control — restarts when sound choice changes
  useEffect(() => {
    if (isActive && musicEnabled) {
      soundHandleRef.current = createSoundscape(audioContextRef, sound, volume);
    }

    return () => {
      stopSoundscape(audioContextRef, soundHandleRef.current);
      soundHandleRef.current = null;
    };
  }, [isActive, musicEnabled, sound]);

  // Update volume in real-time
  useEffect(() => {
    if (isActive && musicEnabled && soundHandleRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const master = soundHandleRef.current.master;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(BASE_GAIN[sound] * volume, now + 0.1);
    }
  }, [volume, isActive, musicEnabled, sound]);

  // Breathing cycle (4 seconds in, 4 seconds out)
  useEffect(() => {
    let phaseInterval: ReturnType<typeof setInterval> | undefined;

    if (isActive) {
      phaseInterval = setInterval(() => {
        setBreathePhase(prev => {
          const nextPhase = prev === 'in' ? 'out' : 'in';

          if (prev === 'out') {
            setCycleCount(count => count + 1);
          }

          return nextPhase;
        });
      }, 4000);
    }

    return () => {
      if (phaseInterval !== undefined) clearInterval(phaseInterval);
    };
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

  const toggleMusic = () => {
    setMusicEnabled(prev => !prev);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      {/* Header with enhanced styling */}
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-zen rounded-2xl flex items-center justify-center mx-auto animate-float shadow-zen">
          <Wind className="h-10 w-10 text-white drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">1-Min Reset</h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          Focus on your breath and find your center
        </p>
      </div>

      {/* Breathing Circle */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-10 bg-card/50 backdrop-blur-sm border-border shadow-large rounded-3xl w-full max-w-sm mx-auto">
          <div className="text-center space-y-8">
            {/* Animated Circle */}
            <div className="relative flex items-center justify-center">
              <div 
                className={`w-40 h-40 rounded-full bg-gradient-zen flex items-center justify-center transition-all duration-[4000ms] shadow-zen ${
                  isActive ? 'animate-breathe' : ''
                }`}
              >
                <div className="text-white font-bold text-xl drop-shadow-md">
                  {isActive ? (breathePhase === 'in' ? 'Breathe In' : 'Breathe Out') : 'Ready'}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-3">
              <div className="text-4xl font-bold text-foreground tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <div className="text-base text-muted-foreground font-medium">
                Breathing cycles: {cycleCount}
              </div>
            </div>

            {/* Instructions */}
            {isActive && (
              <div className="text-base text-muted-foreground font-medium animate-fade-in">
                {breathePhase === 'in' ? 'Inhale slowly through your nose' : 'Exhale gently through your mouth'}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        {musicEnabled && (
          <div className="space-y-4 animate-fade-in">
            {/* Sound picker */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground px-1">Sound</label>
              <div className="grid grid-cols-3 gap-2">
                {SOUNDS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => (id === 'pad' || premium.active ? setSoundChoice(id) : navigate('premium'))}
                    className={`relative flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-300 ${
                      sound === id
                        ? 'bg-primary/15 border-primary text-primary shadow-soft'
                        : 'bg-card/50 border-border text-muted-foreground hover:bg-card hover:text-foreground'
                    } ${id !== 'pad' && !premium.active ? 'opacity-60' : ''}`}
                  >
                    {id !== 'pad' && !premium.active && (
                      <Lock className="absolute top-1.5 right-1.5 h-3 w-3" />
                    )}
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
              {!premium.active && (
                <p className="text-xs text-muted-foreground font-medium px-1">
                  Ocean, Rain, Fire, Forest and Deep Hum unlock with Premium.
                </p>
              )}
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-medium text-muted-foreground">Volume</label>
                <span className="text-sm font-medium text-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(values) => setVolume(values[0])}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!isActive ? (
            <Button
              onClick={handleStart}
              disabled={timeLeft === 0}
              className="flex-1 bg-gradient-zen text-white hover:opacity-90 h-14 text-lg font-bold rounded-2xl shadow-zen transition-all duration-300 hover:shadow-large hover:scale-[1.02]"
            >
              <Play className="mr-2 h-6 w-6" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 text-lg font-bold rounded-2xl shadow-medium transition-all duration-300 hover:scale-[1.02]"
            >
              <Pause className="mr-2 h-6 w-6" />
              Pause
            </Button>
          )}

          <Button
            onClick={toggleMusic}
            variant="outline"
            className="h-14 px-7 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105"
            title={musicEnabled ? "Disable ambient music" : "Enable ambient music"}
          >
            {musicEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="h-14 px-7 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground font-medium">
            🧘‍♀️ Focus on the rhythm. Let each breath calm your mind.
          </p>
        </div>
      </div>
    </div>
  );
};
