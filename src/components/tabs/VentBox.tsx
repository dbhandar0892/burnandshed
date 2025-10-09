import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Scissors } from 'lucide-react';
import { toast } from 'sonner';

// Function to create paper shredding sound effect
const playShredSound = (duration: number) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create multiple noise bursts to simulate strips being shredded
  const createShredBurst = (startTime: number, burstDuration: number) => {
    const bufferSize = audioContext.sampleRate * burstDuration / 1000;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate sharp, high-frequency noise for paper ripping
    for (let i = 0; i < bufferSize; i++) {
      const intensity = Math.sin(i / 200) * 0.5 + 0.5;
      output[i] = (Math.random() * 2 - 1) * intensity * 0.4;
    }
    
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    // High-pass filter for sharp, crisp paper sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    
    // Additional band-pass filter for more realistic paper tearing
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 5000;
    bandpass.Q.value = 2;
    
    // Gain envelope for burst effect
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, startTime + burstDuration / 1000);
    
    // Connect nodes
    noiseSource.connect(filter);
    filter.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noiseSource.start(startTime);
    noiseSource.stop(startTime + burstDuration / 1000);
    
    return noiseSource;
  };
  
  // Create multiple bursts throughout the shredding duration
  const sources = [];
  const numBursts = Math.floor(duration / 80); // One burst every 80ms
  
  for (let i = 0; i < numBursts; i++) {
    const startTime = audioContext.currentTime + (i * 0.08);
    const burstDuration = 60 + Math.random() * 40; // Vary burst duration
    sources.push(createShredBurst(startTime, burstDuration));
  }
  
  return { audioContext, sources };
};

export const VentBox = () => {
  const [text, setText] = useState('');
  const [isShedding, setIsShedding] = useState(false);
  const audioContextRef = useRef<{ audioContext: AudioContext; sources: AudioBufferSourceNode[] } | null>(null);

  const handleShed = () => {
    if (!text.trim()) {
      toast.error('Write something to shed first!');
      return;
    }

    setIsShedding(true);
    
    // Calculate shredding duration based on text length
    const chars = text.length;
    const stripWidth = 3;
    const numStrips = Math.ceil(chars / stripWidth);
    const shreddingDuration = numStrips * 50 + 1500; // Strip delay + animation
    
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
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-float">
          <Scissors className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Vent Box</h2>
        <p className="text-muted-foreground">Write what's bothering you, then shed it away like old skin</p>
      </div>

      {/* Text Input / Shredding Animation */}
      <div className="flex-1 space-y-4 relative overflow-hidden">
        {!isShedding ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your frustrations here... Let it all out!"
            className="min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none transition-all text-2xl"
            disabled={isShedding}
          />
        ) : (
          <div className="min-h-[200px] bg-card border border-border rounded-md p-3 relative overflow-visible">
            <div className="relative flex flex-wrap gap-0 text-2xl leading-relaxed">
              {text.split('').map((char, index) => {
                const totalChars = text.length;
                const stripWidth = 3;
                const stripIndex = Math.floor(index / stripWidth);
                const randomX = (Math.random() - 0.5) * 40;
                const randomRotate = (Math.random() - 0.5) * 180;
                const delay = stripIndex * 50;
                const isSpace = char === ' ';
                
                return (
                  <span
                    key={index}
                    className="inline-block animate-shred-strip"
                    style={{
                      animationDelay: `${delay}ms`,
                      animationDuration: '1.5s',
                      animationFillMode: 'forwards',
                      // @ts-ignore - CSS custom properties
                      '--shred-x': `${randomX}px`,
                      '--shred-rotate': `${randomRotate}deg`,
                    }}
                  >
                    {isSpace ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        <Button
          onClick={handleShed}
          disabled={isShedding || !text.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-semibold rounded-lg shadow-soft"
        >
          {isShedding ? (
            <>
              <Scissors className="mr-2 h-5 w-5 animate-pulse" />
              Shedding...
            </>
          ) : (
            <>
              <Scissors className="mr-2 h-5 w-5" />
              Shed It Away
            </>
          )}
        </Button>
      </div>

      {/* Privacy Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your words shed away like old skin. Complete privacy guaranteed.
        </p>
      </div>
    </div>
  );
};