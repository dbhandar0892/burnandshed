import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { setVentText, useVentText } from '@/lib/ventText';
import { logActivity } from '@/lib/activity';
import { segmentText } from '@/lib/textSegments';

const WAVE_MS = 2400;
const CHAR_FADE_MS = 900;
const DROP_COUNT = 14;

// Soft water whoosh with gentle droplet plinks
const playWashSound = (durationMs: number) => {
  const AudioContextClass = window.AudioContext || (window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  }).webkitAudioContext;

  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = 0.55;
  master.connect(context.destination);

  const seconds = durationMs / 1000;
  const now = context.currentTime;

  // Rising-and-falling water whoosh
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const t = i / context.sampleRate;
    const swell = Math.sin((t / seconds) * Math.PI);
    const lap = 0.75 + 0.25 * Math.sin(t * Math.PI * 3.1);
    data[i] = (Math.random() * 2 - 1) * swell * lap;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.Q.value = 0.6;
  lowpass.frequency.setValueAtTime(500, now);
  lowpass.frequency.linearRampToValueAtTime(2400, now + seconds * 0.4);
  lowpass.frequency.linearRampToValueAtTime(400, now + seconds);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.35);
  gain.gain.setValueAtTime(0.5, now + seconds - 0.5);
  gain.gain.linearRampToValueAtTime(0, now + seconds);

  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(master);
  source.start(now);
  source.stop(now + seconds);

  // Gentle droplet plinks
  const plinks = Math.max(5, Math.floor(seconds * 4));
  for (let i = 0; i < plinks; i += 1) {
    const start = now + 0.15 + Math.random() * Math.max(0.1, seconds - 0.5);
    const osc = context.createOscillator();
    osc.type = 'sine';
    const base = 900 + Math.random() * 900;
    osc.frequency.setValueAtTime(base, start);
    osc.frequency.exponentialRampToValueAtTime(base * 0.55, start + 0.09);
    const g = context.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.12, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
    osc.connect(g);
    g.connect(master);
    osc.start(start);
    osc.stop(start + 0.14);
  }

  return context;
};

export const ShedIt = () => {
  const text = useVentText();
  const setText = setVentText;
  const [isWashing, setIsWashing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRefs = useRef<number[]>([]);

  // Left-to-right wash order, synced with the sweeping wave
  const charDelays = useMemo(() => {
    const count = Array.from(text).filter((ch) => !/\s/.test(ch)).length;
    const interval = Math.min(55, Math.max(12, (WAVE_MS - 1400) / Math.max(1, count)));
    const delays = new Map<number, number>();
    let rank = 0;
    Array.from(text).forEach((ch, index) => {
      if (!/\s/.test(ch)) {
        delays.set(index, 180 + rank * interval);
        rank += 1;
      }
    });
    return delays;
  }, [text]);

  const textSegments = useMemo(() => segmentText(text), [text]);

  useEffect(() => () => {
    timerRefs.current.forEach(window.clearTimeout);
    audioContextRef.current?.close().catch(() => undefined);
  }, []);

  const handleShed = () => {
    if (!text.trim()) {
      toast.error('Write something to shed first!');
      return;
    }

    const totalDuration = WAVE_MS + 800;
    setIsWashing(true);

    audioContextRef.current = playWashSound(totalDuration);
    logActivity('shed');

    timerRefs.current.push(window.setTimeout(() => {
      toast.success('🌊 Washed away and released.');
    }, WAVE_MS * 0.5));

    timerRefs.current.push(window.setTimeout(() => {
      setText('');
      setIsWashing(false);
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
      timerRefs.current = [];
    }, totalDuration));
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-calm rounded-2xl flex items-center justify-center mx-auto animate-float shadow-primary">
          <Droplets className="h-10 w-10 text-white drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Shed It</h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          Write what's weighing on you, then let a soft wave carry it away
        </p>
      </div>

      {/* Text Input / Washing Animation */}
      <div className="flex-1 space-y-4">
        {!isWashing ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what's on your mind... Let it all out!"
            className="min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none transition-all text-2xl"
            disabled={isWashing}
          />
        ) : (
          <div className="wash-stage min-h-[200px]" aria-live="polite">
            <div className="wash-message text-2xl leading-relaxed whitespace-pre-wrap">
              {textSegments.map((segment) => {
                if (segment.type === 'break') return <br key={`break-${segment.index}`} />;
                if (segment.type === 'space') return <span key={`space-${segment.index}`}>{segment.text}</span>;

                return (
                  <span className="release-word" key={`word-${segment.characters[0]?.index ?? 0}`}>
                    {segment.characters.map(({ character, index }) => (
                      <span
                        key={index}
                        className="wash-character"
                        style={{ '--wash-delay': `${charDelays.get(index) ?? 0}ms` } as React.CSSProperties}
                      >
                        <span className="wash-glyph">{character}</span>
                      </span>
                    ))}
                  </span>
                );
              })}
            </div>

            {Array.from({ length: DROP_COUNT }).map((_, i) => (
              <span
                key={`drop-${i}`}
                className="wash-drop"
                style={{
                  left: `${4 + Math.random() * 88}%`,
                  top: `${10 + Math.random() * 70}%`,
                  ['--drop-delay' as any]: `${Math.random() * WAVE_MS}ms`,
                  ['--drop-x' as any]: `${(Math.random() - 0.5) * 26}px`,
                }}
              />
            ))}

            <div className="wash-wave-back" />
            <div className="wash-wave" />
          </div>
        )}

        <Button
          onClick={handleShed}
          disabled={isWashing || !text.trim()}
          className="w-full bg-gradient-calm text-white hover:opacity-90 h-16 text-lg font-bold rounded-2xl shadow-primary transition-all duration-300 hover:shadow-large hover:scale-[1.02]"
        >
          <Droplets className={`mr-2 h-6 w-6 ${isWashing ? 'animate-pulse' : ''}`} />
          {isWashing ? 'Washing...' : 'Shed It Away'}
        </Button>
      </div>

      {/* Privacy Note */}
      <div className="text-center mt-auto pt-4">
        <p className="text-sm text-muted-foreground font-medium">
          🔒 Your words shed away like old skin. Complete privacy guaranteed.
        </p>
      </div>
    </div>
  );
};
