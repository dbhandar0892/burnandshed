import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Music, Waves, CloudRain } from 'lucide-react';

type SoundId = 'pad' | 'ocean' | 'rain';

const SOUNDS: { id: SoundId; label: string; icon: typeof Music }[] = [
  { id: 'pad', label: 'Ambient', icon: Music },
  { id: 'ocean', label: 'Ocean', icon: Waves },
  { id: 'rain', label: 'Rain', icon: CloudRain },
];

// Base per-sound output level, before the user volume slider
const BASE_GAIN: Record<SoundId, number> = { pad: 0.5, ocean: 0.45, rain: 0.4 };

interface SoundHandle {
  stops: (OscillatorNode | AudioBufferSourceNode)[];
  master: GainNode;
  intervals: ReturnType<typeof setInterval>[];
}

const makeNoiseBuffer = (ctx: AudioContext) => {
  const seconds = 2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    // Pink-ish noise for a softer, more natural sound
    const white = Math.random() * 2 - 1;
    last = 0.97 * last + 0.03 * white;
    data[i] = last * 3.5;
  }
  return buffer;
};

const createSoundscape = (
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  sound: SoundId,
  volume: number
): SoundHandle => {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }
  const ctx = audioContextRef.current;
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(BASE_GAIN[sound] * volume, now + 3);
  master.connect(ctx.destination);

  const stops: (OscillatorNode | AudioBufferSourceNode)[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];

  if (sound === 'pad') {
    // Warm C major 9th pad with gentle vibrato
    const frequencies = [65.41, 82.41, 98.0, 146.83, 164.81]; // C2, E2, G2, D3, E3
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const voice = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, now);
      lfoGain.gain.setValueAtTime(2, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(1, now);

      voice.gain.setValueAtTime(1 / frequencies.length, now);

      osc.connect(filter);
      filter.connect(voice);
      voice.connect(master);

      osc.start(now);
      stops.push(osc, lfo);
    });
  } else if (sound === 'ocean') {
    // Slow rolling waves: pink noise through a low-pass whose cutoff and
    // level swell on long LFO cycles
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(0.8, now);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.6, now);

    // Swell the wave level (~8 second cycle)
    const levelLfo = ctx.createOscillator();
    const levelDepth = ctx.createGain();
    levelLfo.frequency.setValueAtTime(0.12, now);
    levelDepth.gain.setValueAtTime(0.35, now);
    levelLfo.connect(levelDepth);
    levelDepth.connect(waveGain.gain);
    levelLfo.start(now);

    // Sweep the filter cutoff so each wave sounds different
    const filterLfo = ctx.createOscillator();
    const filterDepth = ctx.createGain();
    filterLfo.frequency.setValueAtTime(0.07, now);
    filterDepth.gain.setValueAtTime(250, now);
    filterLfo.connect(filterDepth);
    filterDepth.connect(filter.frequency);
    filterLfo.start(now);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(master);
    noise.start(now);

    stops.push(noise, levelLfo, filterLfo);
  } else {
    // Rain: steady filtered hiss plus random soft droplet ticks
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;

    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(1800, now);
    band.Q.setValueAtTime(0.5, now);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.55, now);

    noise.connect(band);
    band.connect(rainGain);
    rainGain.connect(master);
    noise.start(now);
    stops.push(noise);

    // Droplet ticks
    intervals.push(
      setInterval(() => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900 + Math.random() * 900, t);
        tickGain.gain.setValueAtTime(0.08 + Math.random() * 0.06, t);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        osc.connect(tickGain);
        tickGain.connect(master);
        osc.start(t);
        osc.stop(t + 0.1);
      }, 120)
    );
  }

  return { stops, master, intervals };
};

const stopSoundscape = (
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  handle: SoundHandle | null
) => {
  if (!audioContextRef.current || !handle) return;

  const ctx = audioContextRef.current;
  const now = ctx.currentTime;

  handle.intervals.forEach(clearInterval);
  handle.master.gain.cancelScheduledValues(now);
  handle.master.gain.setValueAtTime(handle.master.gain.value, now);
  handle.master.gain.linearRampToValueAtTime(0, now + 1);

  setTimeout(() => {
    handle.stops.forEach((s) => {
      try {
        s.stop();
      } catch {
        // already stopped
      }
    });
    handle.master.disconnect();
  }, 1000);
};

export const BreathingReset = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [breathePhase, setBreathePhase] = useState<'in' | 'out'>('in');
  const [cycleCount, setCycleCount] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sound, setSound] = useState<SoundId>('pad');
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
                    onClick={() => setSound(id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-300 ${
                      sound === id
                        ? 'bg-primary/15 border-primary text-primary shadow-soft'
                        : 'bg-card/50 border-border text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
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
