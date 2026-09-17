import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { setVentText, useVentText } from '@/lib/ventText';

// Motor + grinding paper shredder sound
const playShredSound = (duration: number) => {
  const sources: AudioBufferSourceNode[] = [];
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const master = audioContext.createGain();
  master.gain.value = 0.9;
  master.connect(audioContext.destination);

  const now = audioContext.currentTime;
  const seconds = duration / 1000;

  // Motor hum (low oscillators with slight detune)
  const motorGain = audioContext.createGain();
  motorGain.gain.setValueAtTime(0, now);
  motorGain.gain.linearRampToValueAtTime(0.22, now + 0.18);
  motorGain.gain.setValueAtTime(0.22, now + seconds - 0.35);
  motorGain.gain.linearRampToValueAtTime(0, now + seconds);
  const motorFilter = audioContext.createBiquadFilter();
  motorFilter.type = 'lowpass';
  motorFilter.frequency.value = 420;
  motorGain.connect(motorFilter);
  motorFilter.connect(master);

  [58, 87, 116].forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    osc.type = i === 0 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(freq * 0.7, now);
    osc.frequency.linearRampToValueAtTime(freq, now + 0.35);
    osc.frequency.setValueAtTime(freq, now + seconds - 0.3);
    osc.frequency.linearRampToValueAtTime(freq * 0.6, now + seconds);
    const g = audioContext.createGain();
    g.gain.value = i === 0 ? 0.6 : 0.2;
    osc.connect(g);
    g.connect(motorGain);
    osc.start(now);
    osc.stop(now + seconds);
    sources.push(osc as unknown as AudioBufferSourceNode);
  });

  // Continuous grinding / paper tearing noise
  const bufferSize = Math.max(1, Math.floor(audioContext.sampleRate * seconds));
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / audioContext.sampleRate;
    // grinding wobble from the blades biting the paper
    const bite = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 26));
    const tear = 0.7 + 0.3 * Math.sin(t * Math.PI * 7.3);
    output[i] = (Math.random() * 2 - 1) * bite * tear;
  }
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const bandpass = audioContext.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 2600;
  bandpass.Q.value = 0.8;

  const highShelf = audioContext.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 5200;
  highShelf.gain.value = 5;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.3);
  noiseGain.gain.setValueAtTime(0.28, now + seconds - 0.4);
  noiseGain.gain.linearRampToValueAtTime(0, now + seconds);

  noiseSource.connect(bandpass);
  bandpass.connect(highShelf);
  highShelf.connect(noiseGain);
  noiseGain.connect(master);
  noiseSource.start(now);
  noiseSource.stop(now + seconds);
  sources.push(noiseSource);

  return { audioContext, sources };
};

export const VentBox = () => {
  const text = useVentText();
  const setText = setVentText;
  const [isShedding, setIsShedding] = useState(false);
  const audioContextRef = useRef<{ audioContext: AudioContext; sources: AudioBufferSourceNode[] } | null>(null);

  const handleShed = () => {
    if (!text.trim()) {
      toast.error('Write something to shed first!');
      return;
    }

    setIsShedding(true);
    
    // Shredding takes a fixed, machine-like time
    const shreddingDuration = SHRED_DURATION_MS + 250;

    
    // Play realistic shredding sound
    audioContextRef.current = playShredSound(shreddingDuration);
    toast.success('🗑️ Shredded and released!');
    
    // Increment tracker count in localStorage
    const currentCount = parseInt(localStorage.getItem('shedCount') || '0');
    localStorage.setItem('shedCount', (currentCount + 1).toString());
    
    // Clear after animation completes
    setTimeout(() => {
      setText('');
      setIsShedding(false);
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.audioContext.close();
        audioContextRef.current = null;
      }
    }, shreddingDuration);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      {/* Header with enhanced styling */}
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-calm rounded-2xl flex items-center justify-center mx-auto animate-float shadow-primary">
          <Scissors className="h-10 w-10 text-white drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Vent Box</h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          Write what's bothering you, then shed it away like old skin
        </p>
      </div>

      {/* Text Input / Shredding Animation */}
      <div className="flex-1 space-y-4 relative overflow-hidden">
        {!isShedding ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your frustrations here... Let it all out!"
            className="min-h-[200px] bg-black border-border text-white placeholder:text-white/50 resize-none transition-all text-2xl"
            disabled={isShedding}
          />
        ) : (
          <div className="shredder min-h-[300px] bg-card border border-border rounded-md">

            {/* Paper feeding into the machine */}
            <div className="shredder-feed">
              <div
                className="shredder-sheet"
                style={{ ['--shred-duration' as any]: `${SHRED_DURATION_MS}ms` }}
              >
                {text}
              </div>
            </div>

            {/* The shredder machine */}
            <div className="shredder-body">
              <div className="shredder-slot">
                <div className="shredder-teeth" />
              </div>
              <div className="shredder-glow" />
            </div>

            {/* Shredded strips falling out */}
            <div className="shredder-output">
              {Array.from({ length: STRIP_COUNT }).map((_, i) => {
                const width = 100 / STRIP_COUNT;
                const drift = (i - STRIP_COUNT / 2) * 2.2 + (Math.random() - 0.5) * 14;
                const rot = (Math.random() - 0.5) * 26;
                return (
                  <div
                    key={i}
                    className="shredder-strip"
                    style={{
                      left: `${i * width}%`,
                      width: `${width}%`,
                      ['--shred-duration' as any]: `${SHRED_DURATION_MS}ms`,
                      ['--strip-delay' as any]: `${Math.random() * 90}ms`,
                      ['--strip-x' as any]: `${drift}px`,
                      ['--strip-rot' as any]: `${rot}deg`,
                    }}
                  >
                    <div
                      className="shredder-strip-inner"
                      style={{ width: `${STRIP_COUNT * 100}%`, left: `-${i * 100}%` }}
                    >
                      {text}
                    </div>
                  </div>
                );
              })}
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={`dust-${i}`}
                  className="shredder-dust"
                  style={{
                    left: `${5 + i * 9 + Math.random() * 5}%`,
                    animationDelay: `${Math.random() * 800}ms`,
                    ['--dust-x' as any]: `${(Math.random() - 0.5) * 30}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        )}
        
        <Button
          onClick={handleShed}
          disabled={isShedding || !text.trim()}
          className="w-full bg-gradient-calm text-white hover:opacity-90 h-16 text-lg font-bold rounded-2xl shadow-primary transition-all duration-300 hover:shadow-large hover:scale-[1.02]"
        >
          {isShedding ? (
            <>
              <Scissors className="mr-2 h-6 w-6 animate-pulse" />
              Shedding...
            </>
          ) : (
            <>
              <Scissors className="mr-2 h-6 w-6" />
              Shed It Away
            </>
          )}
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