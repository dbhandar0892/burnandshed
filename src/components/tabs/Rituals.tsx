import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, ArrowLeft, Flame, Droplets, Scissors, Wind, Volume2, VolumeX } from 'lucide-react';
import { usePremium } from '@/lib/premium';
import { PremiumLock } from '@/components/PremiumLock';
import { setVentText } from '@/lib/ventText';
import { navigate, ViewId } from '@/lib/nav';

const FEELINGS = [
  { id: 'anger', label: 'Anger', prompt: 'What made you angry? Say it exactly how it feels.' },
  { id: 'anxiety', label: 'Anxiety', prompt: 'What is the worry circling in your head right now?' },
  { id: 'sadness', label: 'Sadness', prompt: 'What hurts? Write it down as gently or as bluntly as you like.' },
  { id: 'resentment', label: 'Resentment', prompt: 'Who or what are you still carrying? Put it into words.' },
  { id: 'overwhelm', label: 'Overwhelm', prompt: 'List everything pressing on you. No order needed.' },
  { id: 'shame', label: 'Shame', prompt: 'What are you being hard on yourself about?' },
];

const CLOSING_LINES = [
  'That feeling had its moment. You do not have to carry it any further.',
  'You named it, faced it, and let it go. That is the whole practice.',
  'Lighter than a few minutes ago. Come back whenever you need to.',
  'Nothing to fix right now. You made room, and that is enough.',
];

const RELEASES: { id: ViewId; label: string; icon: typeof Flame; note: string }[] = [
  { id: 'burn', label: 'Burn it', icon: Flame, note: 'Hot and final' },
  { id: 'shed', label: 'Shed it', icon: Droplets, note: 'Washed away' },
  { id: 'shred', label: 'Shred it', icon: Scissors, note: 'Torn to pieces' },
];

const BREATH_CYCLES = 3;

const PHASE_MS = 4000;

export const Rituals = () => {
  const premium = usePremium();
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState<typeof FEELINGS[number] | null>(null);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [cycles, setCycles] = useState(0);
  const [muted, setMuted] = useState(false);
  const [closing] = useState(() => CLOSING_LINES[Math.floor(Math.random() * CLOSING_LINES.length)]);
  const audioRef = useRef<AudioContext | null>(null);

  const getContext = () => {
    if (!audioRef.current) {
      const Ctx = window.AudioContext || (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;
      if (!Ctx) return null;
      audioRef.current = new Ctx();
    }
    if (audioRef.current.state === 'suspended') audioRef.current.resume().catch(() => undefined);
    return audioRef.current;
  };

  // Soft breath cue: rising airy swell on inhale, falling on exhale
  const playBreathCue = (dir: 'in' | 'out') => {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const seconds = PHASE_MS / 1000;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.28, now + seconds * 0.35);
    master.gain.linearRampToValueAtTime(0, now + seconds);
    master.connect(ctx.destination);

    // Breath-like filtered noise
    const size = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i += 1) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(dir === 'in' ? 420 : 900, now);
    bp.frequency.linearRampToValueAtTime(dir === 'in' ? 1100 : 320, now + seconds);
    noise.connect(bp);
    bp.connect(master);
    noise.start(now);
    noise.stop(now + seconds);

    // Warm tone gliding with the breath
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(dir === 'in' ? 196 : 262, now);
    osc.frequency.linearRampToValueAtTime(dir === 'in' ? 262 : 196, now + seconds);
    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0, now);
    toneGain.gain.linearRampToValueAtTime(0.1, now + seconds * 0.4);
    toneGain.gain.linearRampToValueAtTime(0, now + seconds);
    osc.connect(toneGain);
    toneGain.connect(master);
    osc.start(now);
    osc.stop(now + seconds);
  };

  // Breathing step timer
  useEffect(() => {
    if (step !== 2) return;
    playBreathCue('in');
    const timer = setInterval(() => {
      setPhase(prev => {
        const next = prev === 'in' ? 'out' : 'in';
        if (prev === 'out') setCycles(c => c + 1);
        playBreathCue(next);
        return next;
      });
    }, PHASE_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, muted]);

  useEffect(() => () => {
    audioRef.current?.close().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (step === 2 && cycles >= BREATH_CYCLES) setStep(3);
  }, [cycles, step]);

  if (!premium.active) {
    return (
      <div className="h-full overflow-y-auto p-6 space-y-6">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-calm rounded-2xl flex items-center justify-center mx-auto animate-float shadow-primary">
            <Sparkles className="h-10 w-10 text-white drop-shadow-md" />
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Guided Rituals</h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
            A calm, step-by-step release: name the feeling, write it out, breathe, then let it go.
          </p>
        </div>
        <PremiumLock
          title="Guided Rituals is a Premium feature"
          description="Walk through a complete release in four gentle steps, with prompts written for what you are feeling."
        />
      </div>
    );
  }

  const reset = () => {
    setStep(0);
    setFeeling(null);
    setText('');
    setPhase('in');
    setCycles(0);
  };

  const release = (target: ViewId) => {
    setVentText(text);
    navigate(target);
    reset();
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-calm rounded-2xl flex items-center justify-center mx-auto shadow-primary">
          <Sparkles className="h-8 w-8 text-white drop-shadow-md" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Guided Ritual</h2>
        <Progress value={((step + 1) / 5) * 100} className="h-1.5 max-w-xs mx-auto" />
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
          Step {step + 1} of 5
        </p>
      </div>

      {step === 0 && (
        <Card className="p-6 rounded-2xl shadow-medium space-y-5 animate-fade-in">
          <h3 className="font-bold text-lg text-foreground">What are you feeling?</h3>
          <div className="grid grid-cols-2 gap-3">
            {FEELINGS.map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setFeeling(f);
                  setStep(1);
                }}
                className="py-4 rounded-2xl border border-border bg-card/60 font-semibold text-foreground transition-all duration-300 hover:bg-primary/10 hover:border-primary hover:scale-[1.03]"
              >
                {f.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === 1 && feeling && (
        <Card className="p-6 rounded-2xl shadow-medium space-y-5 animate-fade-in">
          <h3 className="font-bold text-lg text-foreground">{feeling.label}</h3>
          <p className="text-sm text-muted-foreground font-medium">{feeling.prompt}</p>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write freely. Nobody else will ever read this."
            className="min-h-[160px] resize-none rounded-2xl bg-card text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 rounded-2xl px-5" onClick={() => setStep(0)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              disabled={!text.trim()}
              onClick={() => setStep(2)}
              className="flex-1 h-12 rounded-2xl bg-gradient-calm text-white font-bold shadow-primary hover:opacity-90"
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-8 rounded-2xl shadow-medium space-y-6 text-center animate-fade-in">
          <h3 className="font-bold text-lg text-foreground">Three slow breaths</h3>
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-full bg-gradient-zen flex items-center justify-center shadow-zen animate-breathe">
              <span className="text-white font-bold text-lg drop-shadow-md">
                {phase === 'in' ? 'Breathe In' : 'Breathe Out'}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {cycles}/{BREATH_CYCLES} breaths
          </p>
          <Button variant="outline" className="h-11 rounded-2xl" onClick={() => setStep(3)}>
            Skip breathing
          </Button>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 rounded-2xl shadow-medium space-y-5 animate-fade-in">
          <h3 className="font-bold text-lg text-foreground">How do you want to let it go?</h3>
          <div className="space-y-3">
            {RELEASES.map(({ id, label, icon: Icon, note }) => (
              <button
                key={id}
                onClick={() => {
                  setStep(4);
                  setTimeout(() => release(id), 1400);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/60 transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:scale-[1.02]"
              >
                <div className="p-3 rounded-xl bg-muted">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-foreground">{label}</div>
                  <div className="text-sm text-muted-foreground font-medium">{note}</div>
                </div>
              </button>
            ))}
          </div>
          <Button variant="outline" className="w-full h-11 rounded-2xl" onClick={() => setStep(1)}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to my words
          </Button>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-8 rounded-2xl shadow-medium space-y-4 text-center animate-fade-in">
          <Wind className="h-10 w-10 text-primary mx-auto animate-float" />
          <p className="text-base font-medium text-foreground leading-relaxed">{closing}</p>
          <p className="text-sm text-muted-foreground font-medium">Taking you to your release…</p>
        </Card>
      )}
    </div>
  );
};
