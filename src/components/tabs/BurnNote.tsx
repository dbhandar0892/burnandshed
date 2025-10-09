import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';
import lightIgniteVideo from '@/assets/light-ignite.mp4';

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
    const characterWalkDuration = 1500; // 1.5s for character to walk in
    const strikeDuration = 500; // 0.5s for striking the match
    const matchstickDuration = 1000; // 1s for matchstick to light
    const charBurnDuration = 60; // 60ms per character for faster spread
    const burningDuration = (chars * charBurnDuration) + 1500;
    const totalDuration = characterWalkDuration + strikeDuration + matchstickDuration + burningDuration;
    
    // Start burning sound only when matchstick touches the words
    setTimeout(() => {
      audioContextRef.current = playBurningSound(burningDuration);
      toast.success('🔥 Burned to ashes and released!');
    }, characterWalkDuration + strikeDuration + matchstickDuration);
    
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
            {/* Light Ignition Video */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <video
                src={lightIgniteVideo}
                autoPlay
                muted
                className="w-full h-full object-cover"
                style={{
                  mixBlendMode: 'screen',
                  opacity: 0.9
                }}
              />
            </div>
                
            
            {/* Burning Text */}
            <div className="text-2xl leading-relaxed whitespace-pre-wrap">
              {text.split('').map((char, charIndex) => {
                const characterWalkDuration = 1500;
                const strikeDuration = 500;
                const matchstickDuration = 1000;
                const totalPreBurnDelay = characterWalkDuration + strikeDuration + matchstickDuration;
                // Burn from bottom (last character) to top (first character)
                const reverseIndex = text.length - 1 - charIndex;
                const charDelay = totalPreBurnDelay + (reverseIndex * 60);
                
                return (
                  <span key={charIndex} className="relative inline-block">
                    {/* Burning edge effect */}
                    <span
                      className="absolute inset-0 pointer-events-none opacity-0 animate-burn-edge"
                      style={{
                        animationDelay: `${charDelay - 200}ms`,
                        background: 'linear-gradient(to top, rgba(255, 100, 0, 0.8), transparent)',
                        filter: 'blur(2px)',
                      }}
                    />
                    
                    {/* Larger flame effect above character */}
                    <span
                      className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-12 pointer-events-none animate-flame-flicker opacity-0"
                      style={{
                        animationDelay: `${charDelay - 100}ms`,
                        animationDuration: '0.3s',
                        animationIterationCount: '4',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 rounded-t-full blur-[3px]"
                        style={{ 
                          boxShadow: '0 0 30px rgba(255, 140, 0, 0.9), 0 0 60px rgba(255, 100, 0, 0.6)' 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-500 to-yellow-400 rounded-t-full blur-sm opacity-80" />
                    </span>
                    
                    {/* Multiple smoke particles */}
                    {[0, 1, 2].map((smokeIndex) => (
                      <span
                        key={`smoke-${smokeIndex}`}
                        className="absolute -top-4 left-1/2 w-3 h-3 rounded-full pointer-events-none opacity-0 animate-smoke-rise"
                        style={{
                          animationDelay: `${charDelay + 300 + smokeIndex * 200}ms`,
                          background: 'radial-gradient(circle, rgba(100, 100, 100, 0.6), transparent)',
                          filter: 'blur(4px)',
                          transform: `translateX(${(smokeIndex - 1) * 8}px)`,
                        }}
                      />
                    ))}
                    
                    {/* Glowing ember particles */}
                    {[0, 1].map((emberIndex) => (
                      <span
                        key={`ember-${emberIndex}`}
                        className="absolute -bottom-4 left-1/2 w-2 h-2 rounded-full bg-orange-500 pointer-events-none opacity-0 animate-ember-glow"
                        style={{
                          animationDelay: `${charDelay + 250 + emberIndex * 150}ms`,
                          animation: `ember-rise 1.2s ease-out forwards, ember-glow 0.5s ease-in-out infinite`,
                          transform: `translateX(${(emberIndex - 0.5) * 12}px)`,
                        }}
                      />
                    ))}
                    
                    {/* Character that burns */}
                    <span
                      className="inline-block animate-burn-letter"
                      style={{
                        animationDelay: `${charDelay}ms`,
                        animationDuration: '1s',
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