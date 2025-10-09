import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';

// Function to create realistic matchstick lighting sound effect
const playMatchstickSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  // 1. Initial strike/scratch sound (0-0.1s)
  const scratchNoise = audioContext.createBufferSource();
  const scratchBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
  const scratchData = scratchBuffer.getChannelData(0);
  for (let i = 0; i < scratchData.length; i++) {
    scratchData[i] = (Math.random() * 2 - 1) * 0.8;
  }
  scratchNoise.buffer = scratchBuffer;
  
  const scratchFilter = audioContext.createBiquadFilter();
  scratchFilter.type = 'highpass';
  scratchFilter.frequency.value = 4000;
  
  const scratchGain = audioContext.createGain();
  scratchGain.gain.setValueAtTime(0.4, now);
  scratchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  scratchNoise.connect(scratchFilter);
  scratchFilter.connect(scratchGain);
  scratchGain.connect(audioContext.destination);
  
  // 2. Ignition spark sound (0.05-0.2s)
  const sparkOsc = audioContext.createOscillator();
  sparkOsc.type = 'square';
  sparkOsc.frequency.setValueAtTime(1200, now + 0.05);
  sparkOsc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
  
  const sparkGain = audioContext.createGain();
  sparkGain.gain.setValueAtTime(0, now + 0.05);
  sparkGain.gain.linearRampToValueAtTime(0.15, now + 0.08);
  sparkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  sparkOsc.connect(sparkGain);
  sparkGain.connect(audioContext.destination);
  
  // 3. Flame whoosh (0.15-0.6s)
  const whooshNoise = audioContext.createBufferSource();
  const whooshBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.45, audioContext.sampleRate);
  const whooshData = whooshBuffer.getChannelData(0);
  for (let i = 0; i < whooshData.length; i++) {
    const env = Math.sin((i / whooshData.length) * Math.PI);
    whooshData[i] = (Math.random() * 2 - 1) * env * 0.5;
  }
  whooshNoise.buffer = whooshBuffer;
  
  const whooshFilter = audioContext.createBiquadFilter();
  whooshFilter.type = 'bandpass';
  whooshFilter.frequency.value = 800;
  whooshFilter.Q.value = 2;
  
  const whooshGain = audioContext.createGain();
  whooshGain.gain.setValueAtTime(0, now + 0.15);
  whooshGain.gain.linearRampToValueAtTime(0.25, now + 0.25);
  whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
  
  whooshNoise.connect(whooshFilter);
  whooshFilter.connect(whooshGain);
  whooshGain.connect(audioContext.destination);
  
  // Play all sounds
  scratchNoise.start(now);
  scratchNoise.stop(now + 0.1);
  sparkOsc.start(now + 0.05);
  sparkOsc.stop(now + 0.2);
  whooshNoise.start(now + 0.15);
  whooshNoise.stop(now + 0.6);
  
  setTimeout(() => audioContext.close(), 700);
};

// Function to create realistic burning/crackling sound effect
const playBurningSound = (duration: number) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const durationInSeconds = duration / 1000;
  
  // Base crackling layer with varied intensity
  const bufferSize = audioContext.sampleRate * durationInSeconds;
  const crackleBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const crackleData = crackleBuffer.getChannelData(0);
  
  // Generate realistic crackling pattern
  for (let i = 0; i < bufferSize; i++) {
    // Low frequency rumble
    const rumble = Math.sin(i / 200) * 0.15;
    // Random crackles with varying intensity
    const crackle = (Math.random() * 2 - 1) * (Math.random() > 0.95 ? 0.8 : 0.2);
    // Mid-frequency hiss
    const hiss = (Math.random() * 2 - 1) * 0.1;
    
    crackleData[i] = rumble + crackle + hiss;
  }
  
  const crackleSource = audioContext.createBufferSource();
  crackleSource.buffer = crackleBuffer;
  
  // Multiple filters for realistic fire sound
  const lowFilter = audioContext.createBiquadFilter();
  lowFilter.type = 'lowpass';
  lowFilter.frequency.value = 3000;
  lowFilter.Q.value = 1;
  
  const highFilter = audioContext.createBiquadFilter();
  highFilter.type = 'highpass';
  highFilter.frequency.value = 100;
  
  // Main gain with fade in/out
  const mainGain = audioContext.createGain();
  mainGain.gain.setValueAtTime(0, audioContext.currentTime);
  mainGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.3);
  mainGain.gain.setValueAtTime(0.3, audioContext.currentTime + durationInSeconds - 0.5);
  mainGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + durationInSeconds);
  
  // Add random pops/snaps
  const popsPerSecond = 3;
  const totalPops = Math.floor(durationInSeconds * popsPerSecond);
  
  for (let i = 0; i < totalPops; i++) {
    const popTime = audioContext.currentTime + (Math.random() * durationInSeconds);
    const popOsc = audioContext.createOscillator();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(300 + Math.random() * 400, popTime);
    
    const popGain = audioContext.createGain();
    popGain.gain.setValueAtTime(0, popTime);
    popGain.gain.linearRampToValueAtTime(0.4, popTime + 0.01);
    popGain.gain.exponentialRampToValueAtTime(0.01, popTime + 0.08);
    
    popOsc.connect(popGain);
    popGain.connect(audioContext.destination);
    popOsc.start(popTime);
    popOsc.stop(popTime + 0.08);
  }
  
  // Connect main crackling sound
  crackleSource.connect(highFilter);
  highFilter.connect(lowFilter);
  lowFilter.connect(mainGain);
  mainGain.connect(audioContext.destination);
  
  // Play
  crackleSource.start(audioContext.currentTime);
  crackleSource.stop(audioContext.currentTime + durationInSeconds);
  
  return { audioContext, source: crackleSource };
};

export const BurnNote = () => {
  const [text, setText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const audioContextRef = useRef<{ audioContext: AudioContext; source: AudioBufferSourceNode } | null>(null);

  const handleBurn = () => {
    if (!text.trim()) {
      toast.error('Write something to burn first!');
      return;
    }

    setIsBurning(true);
    
    // Play matchstick lighting sound immediately
    playMatchstickSound();
    
    // Calculate animation duration based on character count
    const chars = text.length;
    const matchstickDuration = 2000; // 2s for matchstick animation
    const charBurnDuration = 80; // 80ms per character
    const burningDuration = (chars * charBurnDuration) + 1200;
    const totalDuration = matchstickDuration + burningDuration;
    
    // Start burning sound only when matchstick touches the words
    setTimeout(() => {
      audioContextRef.current = playBurningSound(burningDuration);
      toast.success('🔥 Burned to ashes and released!');
    }, matchstickDuration);
    
    // Increment tracker count in localStorage
    const currentCount = parseInt(localStorage.getItem('burnCount') || '0');
    localStorage.setItem('burnCount', (currentCount + 1).toString());
    
    // Clear after animation
    setTimeout(() => {
      setText('');
      setIsBurning(false);
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.audioContext.close();
        audioContextRef.current = null;
      }
    }, totalDuration);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-fire rounded-full flex items-center justify-center mx-auto animate-float">
          <Flame className="h-8 w-8 text-fire-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Burn It Note</h2>
        <p className="text-muted-foreground">Transform your anger into smoke and let it drift away</p>
      </div>

      {/* Text Input */}
      <div className="flex-1 space-y-4">
        {isBurning ? (
          <div className="min-h-[200px] bg-card border border-border rounded-md p-3 overflow-hidden relative">
            {/* Matchstick Animation */}
            <div 
              className="absolute bottom-2 left-2 z-10 animate-matchstick-light"
              style={{ transformOrigin: 'top right' }}
            >
              <div className="relative w-2 h-16 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm">
                {/* Matchstick head */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full" />
                {/* Flame on matchstick */}
                <div 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-6 animate-flame-flicker"
                  style={{ 
                    animationDelay: '0.4s',
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-t-full blur-[1px]" 
                    style={{ 
                      boxShadow: '0 0 20px rgba(255, 165, 0, 0.8), 0 0 40px rgba(255, 100, 0, 0.6)' 
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Burning Text */}
            <div className="text-2xl leading-relaxed whitespace-pre-wrap">
              {text.split('').map((char, charIndex) => {
                const matchstickDelay = 2000; // matchstick animation time
                // Burn from bottom (last character) to top (first character)
                const reverseIndex = text.length - 1 - charIndex;
                const charDelay = matchstickDelay + (reverseIndex * 80);
                
                return (
                  <span key={charIndex} className="relative inline-block">
                    {/* Larger flame effect above character */}
                    <span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-10 pointer-events-none animate-flame-flicker opacity-0"
                      style={{
                        animationDelay: `${charDelay - 100}ms`,
                        animationDuration: '0.2s',
                        animationIterationCount: '5',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 rounded-t-full blur-[2px]"
                        style={{ 
                          boxShadow: '0 0 20px rgba(255, 140, 0, 0.8), 0 0 35px rgba(255, 100, 0, 0.5)' 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-500 to-yellow-400 rounded-t-full blur-sm opacity-70" />
                    </span>
                    
                    {/* Ember particles */}
                    <span
                      className="absolute -bottom-4 left-1/2 w-1 h-1 rounded-full bg-orange-500 pointer-events-none opacity-0"
                      style={{
                        animationDelay: `${charDelay + 200}ms`,
                        animation: 'ember-rise 0.8s ease-out forwards',
                      }}
                    />
                    
                    {/* Character that burns */}
                    <span
                      className="inline-block animate-burn-letter"
                      style={{
                        animationDelay: `${charDelay}ms`,
                        animationDuration: '1.2s',
                        animationFillMode: 'forwards',
                      }}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pour out your anger and frustration here..."
            className="min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none transition-all text-2xl"
            disabled={isBurning}
          />
        )}
        
        <Button
          onClick={handleBurn}
          disabled={isBurning || !text.trim()}
          className="w-full bg-gradient-fire text-fire-foreground hover:opacity-90 h-14 text-lg font-semibold rounded-lg shadow-soft"
        >
          {isBurning ? (
            <>
              <Flame className="mr-2 h-5 w-5 animate-pulse" />
              Burning...
            </>
          ) : (
            <>
              <Flame className="mr-2 h-5 w-5" />
              Burn It Away
            </>
          )}
        </Button>
      </div>

      {/* Privacy Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your words turn to smoke. Nothing is saved or stored.
        </p>
      </div>
    </div>
  );
};