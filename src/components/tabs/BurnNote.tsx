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
            {/* Animated Character - Cute Squirrel */}
            <div 
              className="absolute bottom-2 left-2 z-20 animate-character-walk"
              style={{ 
                animationDuration: '3s',
              }}
            >
              {/* Cute squirrel character */}
              <div className="relative w-12 h-16">
                {/* Big fluffy tail */}
                <div className="absolute -left-4 top-2 w-10 h-12 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 rounded-full transform -rotate-12" 
                  style={{ 
                    clipPath: 'ellipse(60% 70% at 40% 50%)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }} 
                />
                <div className="absolute -left-3 top-3 w-8 h-10 bg-gradient-to-br from-orange-400 to-orange-300 rounded-full transform -rotate-12 opacity-80" 
                  style={{ clipPath: 'ellipse(50% 60% at 40% 50%)' }} 
                />
                
                {/* Body */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-7 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                
                {/* Head */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 border-2 border-orange-600" />
                
                {/* Ears */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-x-2 w-2 h-3 bg-orange-500 rounded-t-full" />
                <div className="absolute top-1 left-1/2 -translate-x-1/2 translate-x-2 w-2 h-3 bg-orange-500 rounded-t-full" />
                
                {/* Eyes */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-x-1.5 w-1.5 h-1.5 bg-gray-800 rounded-full" />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 translate-x-1.5 w-1.5 h-1.5 bg-gray-800 rounded-full" />
                
                {/* Nose */}
                <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-700 rounded-full" />
                
                {/* Belly patch */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-5 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full opacity-80" />
                
                {/* Arms - one holding matchstick */}
                <div className="absolute top-9 left-1/2 -translate-x-1/2 -translate-x-2 w-1.5 h-3 bg-orange-500 rounded-full" />
                <div 
                  className="absolute top-9 left-1/2 -translate-x-1/2 translate-x-1 w-1.5 h-4 bg-orange-500 rounded-full origin-top"
                  style={{
                    transform: 'rotate(-30deg)',
                  }}
                >
                  {/* Matchstick in hand */}
                  <div 
                    className="absolute right-0 top-full w-12 h-1 bg-gradient-to-r from-amber-700 to-amber-800 rounded-full animate-character-strike"
                    style={{
                      animationDelay: '1.5s',
                      transformOrigin: 'left center'
                    }}
                  >
                    {/* Match head */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full" />
                    
                    {/* Flame appears after strike */}
                    <div 
                      className="absolute -right-1 -top-4 w-6 h-8 animate-flame-flicker opacity-0"
                      style={{ 
                        animationDelay: '2s',
                        animationDuration: '0.3s',
                        animationFillMode: 'forwards',
                        transformOrigin: 'bottom center'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-t-full blur-[1px]" 
                        style={{ 
                          boxShadow: '0 0 25px rgba(255, 165, 0, 0.9), 0 0 50px rgba(255, 100, 0, 0.7)' 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-t-full blur-sm opacity-80" />
                    </div>
                  </div>
                </div>
                
                {/* Legs with walking animation */}
                <div className="absolute top-13 left-1/2 -translate-x-1/2">
                  <div className="absolute -left-1 w-1.5 h-3 bg-orange-600 rounded-full" style={{ transform: 'rotate(10deg)' }} />
                  <div className="absolute left-1 w-1.5 h-3 bg-orange-600 rounded-full" style={{ transform: 'rotate(-10deg)' }} />
                </div>
                
                {/* Little feet */}
                <div className="absolute top-15 left-1/2 -translate-x-1/2">
                  <div className="absolute -left-1.5 w-2 h-1.5 bg-orange-700 rounded-full" />
                  <div className="absolute left-0.5 w-2 h-1.5 bg-orange-700 rounded-full" />
                </div>
              </div>
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