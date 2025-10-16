import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// Soothing ambient music generator using Web Audio API
const createAmbientMusic = (audioContextRef: React.MutableRefObject<AudioContext | null>, volume: number) => {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }
  
  const ctx = audioContextRef.current;
  const now = ctx.currentTime;
  
  // Create multiple oscillators for ambient pad sound
  const oscillators: OscillatorNode[] = [];
  const gainNodes: GainNode[] = [];
  
  // Frequencies for a deeply calming chord (C major 9th - uplifting and serene)
  const frequencies = [65.41, 82.41, 98.00, 146.83, 164.81]; // C2, E2, G2, D3, E3
  
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'triangle'; // Warmer, softer tone
    osc.frequency.setValueAtTime(freq, now);
    
    // Add subtle vibrato for organic feel
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, now);
    lfoGain.gain.setValueAtTime(2, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(now);
    
    // Low-pass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1, now);
    
    // Fade in with volume control
    const targetVolume = (0.025 / frequencies.length) * volume;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(targetVolume, now + 3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    
    oscillators.push(osc);
    oscillators.push(lfo);
    gainNodes.push(gain);
  });
  
  return { oscillators, gainNodes };
};

const stopAmbientMusic = (
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  oscillators: OscillatorNode[],
  gainNodes: GainNode[]
) => {
  if (!audioContextRef.current) return;
  
  const ctx = audioContextRef.current;
  const now = ctx.currentTime;
  
  // Fade out
  gainNodes.forEach(gain => {
    gain.gain.linearRampToValueAtTime(0, now + 1);
  });
  
  // Stop oscillators after fade out
  setTimeout(() => {
    oscillators.forEach(osc => osc.stop());
  }, 1000);
};

export const BreathingReset = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [breathePhase, setBreathePhase] = useState<'in' | 'out'>('in');
  const [cycleCount, setCycleCount] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);

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

  // Ambient music control
  useEffect(() => {
    if (isActive && musicEnabled) {
      const { oscillators, gainNodes } = createAmbientMusic(audioContextRef, volume);
      oscillatorsRef.current = oscillators;
      gainNodesRef.current = gainNodes;
    } else if (!isActive || !musicEnabled) {
      if (oscillatorsRef.current.length > 0) {
        stopAmbientMusic(audioContextRef, oscillatorsRef.current, gainNodesRef.current);
        oscillatorsRef.current = [];
        gainNodesRef.current = [];
      }
    }

    return () => {
      if (oscillatorsRef.current.length > 0) {
        stopAmbientMusic(audioContextRef, oscillatorsRef.current, gainNodesRef.current);
        oscillatorsRef.current = [];
        gainNodesRef.current = [];
      }
    };
  }, [isActive, musicEnabled, volume]);

  // Update volume in real-time
  useEffect(() => {
    if (isActive && musicEnabled && gainNodesRef.current.length > 0 && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const frequencies = [110.00, 130.81, 164.81, 196.00, 246.94];
      const targetVolume = (0.025 / frequencies.length) * volume;
      
      gainNodesRef.current.forEach(gain => {
        gain.gain.linearRampToValueAtTime(targetVolume, now + 0.1);
      });
    }
  }, [volume, isActive, musicEnabled]);

  // Breathing cycle (4 seconds in, 4 seconds out)
  useEffect(() => {
    let phaseInterval: NodeJS.Timeout;

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
    if (oscillatorsRef.current.length > 0) {
      stopAmbientMusic(audioContextRef, oscillatorsRef.current, gainNodesRef.current);
      oscillatorsRef.current = [];
      gainNodesRef.current = [];
    }
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
        {/* Volume Control */}
        {musicEnabled && (
          <div className="space-y-3 animate-fade-in">
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