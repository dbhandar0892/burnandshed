import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';
import { setVentText, useVentText } from '@/lib/ventText';
import { logActivity } from '@/lib/activity';
import { segmentText } from '@/lib/textSegments';

const IGNITER_MS = 1500;
const IGNITER_LETTER_INTERVAL = 55;
const IGNITER_PHRASE = "Let's burn this";
const MATCH_SEQUENCE_MS = 450;
const LETTER_INTERVAL_MS = 115;
const LETTER_BURN_MS = 1250;

type MatchPosition = { left: number; top: number };

const playMatchAndFire = (fireDuration: number, startDelaySeconds = 0) => {
  const AudioContextClass = window.AudioContext || (window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  }).webkitAudioContext;

  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = 0.18;
  master.connect(context.destination);

  const makeNoise = (start: number, duration: number, volume: number, frequency: number) => {
    const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < sampleCount; index += 1) {
      const fade = 1 - index / sampleCount;
      data[index] = (Math.random() * 2 - 1) * fade;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
  };

  const now = context.currentTime + startDelaySeconds;
  makeNoise(now, 0.16, 0.75, 2800);
  makeNoise(now + 0.18, 0.28, 0.5, 1100);

  const crackleStart = now + MATCH_SEQUENCE_MS / 1000;
  const crackles = Math.max(8, Math.floor(fireDuration / 240));
  for (let index = 0; index < crackles; index += 1) {
    makeNoise(crackleStart + index * 0.22, 0.045, 0.12 + Math.random() * 0.1, 900 + Math.random() * 1700);
  }

  return context;
};

export const BurnNote = () => {
  const text = useVentText();
  const setText = setVentText;
  const [igniterActive, setIgniterActive] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  const [matchPosition, setMatchPosition] = useState<MatchPosition>({ left: 0, top: 0 });
  const burnAreaRef = useRef<HTMLDivElement>(null);
  const lastCharacterRef = useRef<HTMLSpanElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRefs = useRef<number[]>([]);

  const burnOrder = useMemo(() => {
    const order = new Map<number, number>();
    let rank = 0;
    for (let index = text.length - 1; index >= 0; index -= 1) {
      if (!/\s/.test(text[index])) {
        order.set(index, rank);
        rank += 1;
      }
    }
    return order;
  }, [text]);

  const finalCharacterIndex = useMemo(() => {
    const characters = Array.from(text);
    for (let index = characters.length - 1; index >= 0; index -= 1) {
      if (!/\s/.test(characters[index])) return index;
    }
    return -1;
  }, [text]);

  const textSegments = useMemo(() => segmentText(text), [text]);

  useEffect(() => {
    if (!isBurning || !burnAreaRef.current || !lastCharacterRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      const area = burnAreaRef.current?.getBoundingClientRect();
      const lastCharacter = lastCharacterRef.current?.getBoundingClientRect();
      if (!area || !lastCharacter) return;

      setMatchPosition({
        left: lastCharacter.right - area.left + 3,
        top: lastCharacter.top - area.top + lastCharacter.height * 0.56,
      });
      setAnimationReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isBurning]);

  useEffect(() => () => {
    timerRefs.current.forEach(window.clearTimeout);
    audioContextRef.current?.close().catch(() => undefined);
  }, []);

  const handleBurn = () => {
    if (!text.trim()) {
      toast.error('Write something to burn first!');
      return;
    }

    setAnimationReady(false);
    setIgniterActive(true);

    const characterCount = burnOrder.size;
    const fireDuration = characterCount * LETTER_INTERVAL_MS + LETTER_BURN_MS;
    const totalDuration = IGNITER_MS + MATCH_SEQUENCE_MS + fireDuration;
    audioContextRef.current = playMatchAndFire(fireDuration, IGNITER_MS / 1000);

    logActivity('burn');

    timerRefs.current.push(window.setTimeout(() => {
      setIgniterActive(false);
      setIsBurning(true);
    }, IGNITER_MS));

    timerRefs.current.push(window.setTimeout(() => {
      toast.success('Burned to ashes and released.');
    }, IGNITER_MS + MATCH_SEQUENCE_MS));

    timerRefs.current.push(window.setTimeout(() => {
      setText('');
      setIsBurning(false);
      setAnimationReady(false);
      audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
      timerRefs.current = [];
    }, totalDuration));
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-fire rounded-2xl flex items-center justify-center mx-auto animate-float shadow-fire">
          <Flame className="h-10 w-10 text-primary-foreground drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Burn It Note</h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          Transform your anger into smoke and let it drift away
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {igniterActive ? (
          <div
            className="burn-stage igniter-stage is-ready min-h-[200px] border border-border rounded-md p-3 overflow-hidden relative"
            aria-live="polite"
          >
            <div className="burn-message igniter-phrase text-3xl font-bold tracking-tight text-center w-full">
              {(() => {
                let rank = -1;
                return Array.from(IGNITER_PHRASE).map((character, index) => {
                  if (/\s/.test(character)) {
                    return <span key={index}> </span>;
                  }
                  rank += 1;
                  const delay = rank * IGNITER_LETTER_INTERVAL;
                  return (
                    <span
                      key={index}
                      className="burn-character"
                      style={{ '--burn-delay': `${delay}ms` } as React.CSSProperties}
                    >
                      <span className="burn-character-flame" aria-hidden="true">
                        <span className="burn-character-flame-outer" />
                        <span className="burn-character-flame-middle" />
                        <span className="burn-character-flame-core" />
                      </span>
                      <span className="burn-ember burn-ember-one" aria-hidden="true" />
                      <span className="burn-ember burn-ember-two" aria-hidden="true" />
                      <span className="burn-smoke" aria-hidden="true" />
                      <span className="burn-glyph">{character}</span>
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        ) : isBurning ? (
          <div
            ref={burnAreaRef}
            className={`burn-stage min-h-[200px] border border-border rounded-md p-3 overflow-hidden relative ${animationReady ? 'is-ready' : ''}`}
          >
            {animationReady && (
              <div
                className="burn-match"
                style={{ left: matchPosition.left, top: matchPosition.top }}
                aria-hidden="true"
              >
                <span className="burn-match-flame">
                  <span className="burn-match-flame-outer" />
                  <span className="burn-match-flame-inner" />
                </span>
                <span className="burn-match-head" />
                <span className="burn-match-stick" />
                <span className="burn-match-smoke" />
              </div>
            )}

            <div className="burn-message text-2xl leading-relaxed whitespace-pre-wrap" aria-live="polite">
              {textSegments.map((segment) => {
                if (segment.type === 'break') return <br key={`break-${segment.index}`} />;
                if (segment.type === 'space') return <span key={`space-${segment.index}`}>{segment.text}</span>;

                return (
                  <span className="release-word" key={`word-${segment.characters[0]?.index ?? 0}`}>
                    {segment.characters.map(({ character, index }) => {
                      const rank = burnOrder.get(index);
                      const delay = rank === undefined ? 0 : MATCH_SEQUENCE_MS + rank * LETTER_INTERVAL_MS;

                      return (
                        <span
                          key={index}
                          ref={index === finalCharacterIndex ? lastCharacterRef : undefined}
                          className="burn-character"
                          style={{ '--burn-delay': `${delay}ms` } as React.CSSProperties}
                        >
                          <span className="burn-character-flame" aria-hidden="true">
                            <span className="burn-character-flame-outer" />
                            <span className="burn-character-flame-middle" />
                            <span className="burn-character-flame-core" />
                          </span>
                          <span className="burn-ember burn-ember-one" aria-hidden="true" />
                          <span className="burn-ember burn-ember-two" aria-hidden="true" />
                          <span className="burn-smoke" aria-hidden="true" />
                          <span className="burn-glyph">{character}</span>
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Pour out your anger and frustration here..."
            className="min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none transition-all text-2xl"
          />
        )}

        <Button
          onClick={handleBurn}
          disabled={isBurning || !text.trim()}
          className="w-full bg-gradient-fire text-primary-foreground hover:opacity-90 h-16 text-lg font-bold rounded-2xl shadow-fire transition-all duration-300 hover:shadow-large hover:scale-[1.02]"
        >
          <Flame className={`mr-2 h-6 w-6 ${isBurning ? 'animate-pulse' : ''}`} />
          {isBurning ? 'Burning...' : 'Burn It Away'}
        </Button>
      </div>

      <div className="text-center mt-auto pt-4">
        <p className="text-sm text-muted-foreground font-medium">
          🔒 Your words turn to smoke. Nothing is saved or stored.
        </p>
      </div>
    </div>
  );
};