import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';

// Function to create burning/crackling sound effect
const playBurningSound = (duration: number) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create noise buffer for crackling effect
  const bufferSize = audioContext.sampleRate * duration / 1000;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  // Generate crackling noise pattern
  for (let i = 0; i < bufferSize; i++) {
    const intensity = Math.sin(i / 500) * 0.5 + 0.5; // Varying intensity
    output[i] = (Math.random() * 2 - 1) * intensity * 0.3;
  }
  
  // Create source
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  
  // Create filter for more realistic fire sound
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  
  // Create gain for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.2);
  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + duration / 1000 - 0.5);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);
  
  // Connect nodes
  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Play
  noiseSource.start(audioContext.currentTime);
  noiseSource.stop(audioContext.currentTime + duration / 1000);
  
  return { audioContext, source: noiseSource };
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
            {/* Matchstick Animation - stays visible */}
            <div 
              className="absolute bottom-2 right-2 z-10"
              style={{ transformOrigin: 'top left' }}
            >
              <div className="relative w-2 h-16 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm">
                {/* Matchstick head */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full" />
                {/* Flame on matchstick - stays lit */}
                <div 
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-8 animate-flame-flicker"
                  style={{ 
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-t-full blur-[1px]" 
                    style={{ 
                      boxShadow: '0 0 25px rgba(255, 165, 0, 0.9), 0 0 45px rgba(255, 100, 0, 0.7)' 
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Burning Text */}
            <div className="text-2xl leading-relaxed whitespace-pre-wrap">
              {text.split('').map((char, charIndex) => {
                const matchstickDelay = 2000;
                const reverseIndex = text.length - 1 - charIndex;
                
                // Add natural variation to burning timing
                const baseDelay = reverseIndex * 80;
                const randomOffset = Math.random() * 40 - 20; // ±20ms variation
                const charDelay = matchstickDelay + baseDelay + randomOffset;
                
                // Vary flame size and intensity
                const flameScale = 0.8 + Math.random() * 0.4; // 0.8-1.2x scale
                const flameHeight = 8 + Math.random() * 4; // 8-12 units
                
                // Random ember direction
                const emberAngle = -20 + Math.random() * 40; // -20 to 20 degrees
                const emberDistance = 20 + Math.random() * 30; // 20-50px
                
                return (
                  <span key={charIndex} className="relative inline-block">
                    {/* Dynamic flame effect below character */}
                    <span
                      className="absolute left-1/2 -translate-x-1/2 pointer-events-none animate-flame-flicker opacity-0"
                      style={{
                        bottom: `${flameHeight}px`,
                        width: `${12 * flameScale}px`,
                        height: `${16 * flameScale}px`,
                        animationDelay: `${charDelay - 100}ms`,
                        animationDuration: `${150 + Math.random() * 100}ms`,
                        animationIterationCount: '4',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-t-full blur-[2px]"
                        style={{ 
                          boxShadow: '0 0 25px rgba(255, 140, 0, 0.9), 0 0 40px rgba(255, 100, 0, 0.7)' 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-700 via-orange-400 to-yellow-200 rounded-t-full blur-sm opacity-80" />
                    </span>
                    
                    {/* Multiple ember particles with varied trajectories */}
                    <span
                      className="absolute -bottom-4 left-1/2 w-1 h-1 rounded-full bg-orange-400 pointer-events-none opacity-0"
                      style={{
                        animationDelay: `${charDelay + 200}ms`,
                        animation: 'ember-rise 0.8s ease-out forwards',
                        transform: `rotate(${emberAngle}deg)`,
                      }}
                    />
                    <span
                      className="absolute -bottom-4 left-1/2 w-0.5 h-0.5 rounded-full bg-red-500 pointer-events-none opacity-0"
                      style={{
                        animationDelay: `${charDelay + 300}ms`,
                        animation: 'ember-rise 1s ease-out forwards',
                        transform: `rotate(${-emberAngle}deg)`,
                      }}
                    />
                    
                    {/* Character that burns with natural variation */}
                    <span
                      className="inline-block animate-burn-letter"
                      style={{
                        animationDelay: `${charDelay}ms`,
                        animationDuration: `${1100 + Math.random() * 200}ms`,
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