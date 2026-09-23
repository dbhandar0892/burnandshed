import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, Flame, Droplets, Scissors, Wind, Volume2, VolumeX, Laugh, RotateCcw } from 'lucide-react';
import { usePremium } from '@/lib/premium';
import { PremiumLock } from '@/components/PremiumLock';
import { setVentText } from '@/lib/ventText';
import { navigate, ViewId } from '@/lib/nav';
import { beginRitualRelease, consumeRitualReturn } from '@/lib/ritualFlow';

const RELEASES: { id: Extract<ViewId, 'burn' | 'shred' | 'shed'>; label: string; icon: typeof Flame }[] = [
  { id: 'burn', label: 'Burn', icon: Flame },
  { id: 'shred', label: 'Shred', icon: Scissors },
  { id: 'shed', label: 'Shed', icon: Droplets },
];

const PHASE_MS = 4000;
const RESET_SECONDS = 60;
const FLOW_LABELS = ['VENT', 'RELEASE', 'RESET', 'CHECK-IN'];
const RITUAL_JOKES = [
  "Why don't eggs tell jokes? They'd crack each other up!",
  'What did the ocean say to the beach? Nothing, it just waved.',
  "What do you call a bear with no teeth? A gummy bear!",
  'How do you make a tissue dance? Put a little boogie in it!',
];

type CheckIn = 'better' | 'same' | 'stressed';

export const Rituals = () => {
  const premium = usePremium();
  const [step, setStep] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [secondsLeft, setSecondsLeft] = useState(RESET_SECONDS);
  const [muted, setMuted] = useState(false);
  const [joke, setJoke] = useState('');
  const audioRef = useRef<AudioContext | null>(null);
  const breathCueRef = useRef<{ noise: AudioBufferSourceNode; tone: OscillatorNode; master: GainNode } | null>(null);

  useEffect(() => {
    if (consumeRitualReturn()) {
      setPhase('in');
      setSecondsLeft(RESET_SECONDS);
      setStep(9);
    }
  }, []);

  // Gentle transition screen after a release, before the breathing exercise starts
  useEffect(() => {
    if (step !== 9) return;
    const timer = window.setTimeout(() => {
      setPhase('in');
      setSecondsLeft(RESET_SECONDS);
      setStep(2);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [step]);

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

  const stopBreathCue = () => {
    const cue = breathCueRef.current;
    if (!cue) return;
    const now = audioRef.current?.currentTime ?? 0;
    cue.master.gain.cancelScheduledValues(now);
    cue.master.gain.setValueAtTime(0, now);
    try { cue.noise.stop(); } catch { /* cue already ended */ }
    try { cue.tone.stop(); } catch { /* cue already ended */ }
    cue.master.disconnect();
    breathCueRef.current = null;
  };

  // Soft breath cue: rising airy swell on inhale, falling on exhale
  const playBreathCue = (dir: 'in' | 'out') => {
    if (muted) return;
    stopBreathCue();
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
    breathCueRef.current = { noise, tone: osc, master };
  };

  useEffect(() => {
    if (step !== 2 && step !== 5) return;
    playBreathCue('in');
    const phaseTimer = window.setInterval(() => {
      setPhase(prev => {
        const next = prev === 'in' ? 'out' : 'in';
        playBreathCue(next);
        return next;
      });
    }, PHASE_MS);
    const countdown = window.setInterval(() => {
      setSecondsLeft(previous => {
        if (previous <= 1) {
          window.clearInterval(countdown);
          window.clearInterval(phaseTimer);
          stopBreathCue();
          setStep(step === 2 ? 3 : 6);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(phaseTimer);
      window.clearInterval(countdown);
      stopBreathCue();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, muted]);

  useEffect(() => () => {
    stopBreathCue();
    audioRef.current?.close().catch(() => undefined);
  }, []);

  if (!premium.active) {
    return (
      <div className="h-full overflow-y-auto p-6 space-y-6">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-calm rounded-2xl flex items-center justify-center mx-auto animate-float shadow-primary">
            <Sparkles className="h-10 w-10 text-white drop-shadow-md" />
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Guided Rituals</h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
            Vent, release what is bothering you, reset with one minute of breathing, then check in with yourself.
          </p>
        </div>
        <PremiumLock
          title="Guided Rituals is a Premium feature"
          description="Move through a complete release, a one-minute reset, and gentle check-ins."
        />
      </div>
    );
  }

  const reset = () => {
    setStep(0);
    setText('');
    setPhase('in');
    setSecondsLeft(RESET_SECONDS);
    setJoke('');
  };

  const release = (target: Extract<ViewId, 'burn' | 'shred' | 'shed'>) => {
    beginRitualRelease({ type: target, characterCount: Array.from(text).filter(character => !/\s/.test(character)).length });
    setVentText(text);
    navigate(target);
  };

  const beginAnotherBreath = () => {
    setPhase('in');
    setSecondsLeft(RESET_SECONDS);
    setStep(5);
  };

  const answerFirstCheckIn = (answer: CheckIn) => {
    if (answer === 'better') setStep(8);
    else setStep(4);
  };

  const answerSecondCheckIn = (answer: CheckIn) => {
    setStep(answer === 'stressed' ? 7 : 8);
  };

  const flowIndex = step === 0 ? 0 : step === 1 ? 1 : step === 2 || step === 5 || step === 9 ? 2 : 3;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-calm rounded-2xl flex items-center justify-center mx-auto shadow-primary">
          <Sparkles className="h-8 w-8 text-white drop-shadow-md" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Guided Ritual</h2>
        <Progress value={((flowIndex + 1) / FLOW_LABELS.length) * 100} className="h-1.5 max-w-xs mx-auto" />
        <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto" aria-label="Ritual progress">
          {FLOW_LABELS.map((label, index) => (
            <span key={label} className={`text-[10px] font-bold ${index === flowIndex ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          ))}
        </div>
      </div>

      {step === 0 && (
        <Card className="p-6 rounded-lg shadow-medium space-y-5 animate-fade-in">
          <div>
            <p className="text-xs font-bold text-primary">VENT</p>
            <h3 className="font-bold text-xl text-foreground mt-2">What's bothering you?</h3>
          </div>
          <Textarea value={text} onChange={event => setText(event.target.value)} placeholder="Write" className="min-h-[190px] resize-none rounded-lg bg-card text-foreground placeholder:text-muted-foreground text-lg" />
          <Button disabled={!text.trim()} onClick={() => setStep(1)} className="w-full h-12 font-bold">
            Continue <ArrowRight className="h-5 w-5" />
          </Button>
        </Card>
      )}

      {step === 1 && (
        <Card className="p-6 rounded-lg shadow-medium space-y-5 animate-fade-in">
          <div>
            <p className="text-xs font-bold text-primary">RELEASE</p>
            <h3 className="font-bold text-xl text-foreground mt-2">How do you want to let it go?</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {RELEASES.map(({ id, label, icon: Icon }) => (
              <Button key={id} variant="outline" onClick={() => release(id)} className="h-24 flex-col gap-2 whitespace-normal font-bold">
                <Icon className="h-6 w-6 text-primary" />{label}
              </Button>
            ))}
          </div>
          <p className="text-sm text-center text-muted-foreground">Your full release effect will play, then the ritual will continue.</p>
        </Card>
      )}

      {step === 9 && (
        <Card className="p-8 rounded-lg shadow-medium space-y-6 text-center animate-fade-in">
          <div>
            <p className="text-xs font-bold text-primary">RESET</p>
            <h3 className="font-bold text-xl text-foreground mt-2">Take one minute for yourself.</h3>
          </div>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-zen flex items-center justify-center shadow-zen animate-breathe">
              <Wind className="h-9 w-9 text-primary-foreground drop-shadow-md" />
            </div>
          </div>
          <p className="text-lg font-semibold text-foreground">Breathe in and out...</p>
        </Card>
      )}

      {(step === 2 || step === 5) && (
        <Card className="p-7 rounded-lg shadow-medium space-y-6 text-center animate-fade-in">
          <div>
            <p className="text-xs font-bold text-primary">RESET</p>
            <h3 className="font-bold text-xl text-foreground mt-2">Take one minute for yourself.</h3>
          </div>
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-full bg-gradient-zen flex items-center justify-center shadow-zen animate-breathe">
              <span className="text-primary-foreground font-bold text-lg drop-shadow-md">
                {phase === 'in' ? 'Breathe in...' : 'Breathe out...'}
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">0:{secondsLeft.toString().padStart(2, '0')}</p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMuted(m => !m)}
              aria-label={muted ? 'Unmute breathing sound' : 'Mute breathing sound'}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <CheckInCard title="Feeling a little lighter?" labels={['😌 Yes', '😐 About the same', '😣 Still stressed']} onAnswer={answerFirstCheckIn} />
      )}

      {step === 4 && (
        <Card className="p-7 rounded-lg shadow-medium space-y-5 text-center animate-fade-in">
          <div>
            <p className="text-xs font-bold text-primary">LET'S TRY SOMETHING ELSE</p>
            <h3 className="font-bold text-xl text-foreground mt-2">What might help right now?</h3>
          </div>
          {joke && <p className="p-5 bg-muted rounded-lg text-foreground font-semibold leading-relaxed">{joke}</p>}
          <Button onClick={() => setJoke(RITUAL_JOKES[Math.floor(Math.random() * RITUAL_JOKES.length)])} variant="outline" className="w-full h-14 font-bold">
            <Laugh className="h-5 w-5" /> MAKE ME LAUGH
          </Button>
          <Button onClick={beginAnotherBreath} className="w-full h-14 font-bold">
            <Wind className="h-5 w-5" /> BREATHE AGAIN
          </Button>
          {joke && <Button onClick={() => setStep(6)} variant="ghost" className="w-full">Continue to check-in <ArrowRight className="h-4 w-4" /></Button>}
        </Card>
      )}

      {step === 6 && (
        <CheckInCard title="How are you feeling now?" labels={['😌 Better', '😐 Same', '😣 Still stressed']} onAnswer={answerSecondCheckIn} />
      )}

      {step === 7 && (
        <Card className="p-8 rounded-lg shadow-medium space-y-5 text-center animate-fade-in">
          <p className="text-4xl" aria-hidden="true">💛</p>
          <h3 className="font-bold text-xl text-foreground">You've had a rough day.</h3>
          <p className="text-base text-muted-foreground leading-relaxed">If you can, step away, get some water, stretch, or take a short walk.</p>
          <p className="font-semibold text-foreground">Come back when you're ready.</p>
          <Button onClick={reset} variant="outline" className="w-full"><RotateCcw className="h-4 w-4" /> Start over</Button>
        </Card>
      )}

      {step === 8 && (
        <Card className="p-8 rounded-lg shadow-medium space-y-5 text-center animate-fade-in">
          <Sparkles className="h-10 w-10 text-primary mx-auto" />
          <h3 className="font-bold text-xl text-foreground">You made space for yourself.</h3>
          <p className="text-muted-foreground">Carry that little bit of lightness with you.</p>
          <Button onClick={reset} variant="outline" className="w-full"><RotateCcw className="h-4 w-4" /> Begin another ritual</Button>
        </Card>
      )}
    </div>
  );
};

interface CheckInCardProps {
  title: string;
  labels: [string, string, string];
  onAnswer: (answer: CheckIn) => void;
}

const CheckInCard = ({ title, labels, onAnswer }: CheckInCardProps) => (
  <Card className="p-7 rounded-lg shadow-medium space-y-5 animate-fade-in">
    <div className="text-center">
      <p className="text-xs font-bold text-primary">CHECK-IN</p>
      <h3 className="font-bold text-xl text-foreground mt-2">{title}</h3>
    </div>
    <div className="space-y-3">
      <Button onClick={() => onAnswer('better')} variant="outline" className="w-full h-14 justify-start text-base">{labels[0]}</Button>
      <Button onClick={() => onAnswer('same')} variant="outline" className="w-full h-14 justify-start text-base">{labels[1]}</Button>
      <Button onClick={() => onAnswer('stressed')} variant="outline" className="w-full h-14 justify-start text-base">{labels[2]}</Button>
    </div>
  </Card>
);
