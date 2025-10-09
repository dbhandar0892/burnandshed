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
            {/* Animated Character - Realistic Squirrel */}
            <div 
              className="absolute bottom-2 left-2 z-20 animate-character-walk"
              style={{ 
                animationDuration: '3s',
              }}
            >
              {/* Realistic squirrel character */}
              <div className="relative w-14 h-20">
                {/* Large bushy tail - multiple layers for depth */}
                <div className="absolute -left-6 -top-2 w-14 h-18 bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600 rounded-full transform rotate-45" 
                  style={{ 
                    clipPath: 'path("M 10,5 Q 5,15 8,35 Q 12,50 20,55 Q 35,58 45,50 Q 50,40 48,25 Q 45,10 35,5 Q 22,2 10,5 Z")',
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))'
                  }} 
                />
                {/* Tail highlight layer */}
                <div className="absolute -left-5 -top-1 w-12 h-16 bg-gradient-to-br from-amber-500 via-amber-400 to-transparent rounded-full transform rotate-45 opacity-60" 
                  style={{ 
                    clipPath: 'path("M 15,8 Q 10,18 12,32 Q 15,42 22,46 Q 32,48 38,42 Q 42,35 40,23 Q 38,12 30,8 Q 22,6 15,8 Z")',
                  }} 
                />
                {/* Tail fur texture */}
                <div className="absolute -left-5.5 -top-0.5 w-13 h-17 bg-gradient-to-br from-amber-900/40 via-transparent to-transparent rounded-full transform rotate-45" 
                  style={{ 
                    clipPath: 'path("M 12,6 Q 8,16 10,33 Q 13,45 21,50 Q 33,53 42,46 Q 46,37 44,24 Q 42,11 33,6 Q 23,3 12,6 Z")',
                    filter: 'blur(0.5px)'
                  }} 
                />
                
                {/* Body - rounded and plump */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-10 bg-gradient-to-b from-amber-700 via-amber-600 to-amber-700 rounded-full" 
                  style={{ 
                    boxShadow: 'inset -2px 2px 4px rgba(0,0,0,0.2), inset 2px -2px 4px rgba(255,255,255,0.1)'
                  }}
                />
                
                {/* Belly patch - cream colored */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-5 h-7 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 rounded-full opacity-90"
                  style={{ 
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
                
                {/* Head - rounded with snout */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800"
                  style={{ 
                    boxShadow: 'inset -1px 1px 3px rgba(0,0,0,0.3), inset 1px -1px 2px rgba(255,255,255,0.1)'
                  }}
                />
                
                {/* Snout/muzzle area */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-3 bg-gradient-to-b from-amber-200 to-amber-100 rounded-full"
                  style={{ 
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)'
                  }}
                />
                
                {/* Ears - pointed and furry */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-x-2.5 w-2.5 h-3.5 bg-gradient-to-br from-amber-600 to-amber-800 rounded-t-full transform -rotate-12"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 translate-x-2.5 w-2.5 h-3.5 bg-gradient-to-br from-amber-600 to-amber-800 rounded-t-full transform rotate-12"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
                {/* Inner ear detail */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 -translate-x-2.5 w-1.5 h-2 bg-amber-300/60 rounded-t-full transform -rotate-12" />
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 translate-x-2.5 w-1.5 h-2 bg-amber-300/60 rounded-t-full transform rotate-12" />
                
                {/* Eyes - dark and shiny */}
                <div className="absolute top-4.5 left-1/2 -translate-x-1/2 -translate-x-2 w-2 h-2 bg-gray-900 rounded-full"
                  style={{ 
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Eye shine */}
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
                </div>
                <div className="absolute top-4.5 left-1/2 -translate-x-1/2 translate-x-2 w-2 h-2 bg-gray-900 rounded-full"
                  style={{ 
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Eye shine */}
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
                </div>
                
                {/* Nose - small and dark */}
                <div className="absolute top-6.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-gray-800 rounded-full" />
                
                {/* Whiskers */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 -translate-x-3 w-4 h-px bg-gray-700/50" />
                <div className="absolute top-6.5 left-1/2 -translate-x-1/2 -translate-x-3 w-4 h-px bg-gray-700/50" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 translate-x-3 w-4 h-px bg-gray-700/50 origin-left rotate-180" />
                <div className="absolute top-6.5 left-1/2 -translate-x-1/2 translate-x-3 w-4 h-px bg-gray-700/50 origin-left rotate-180" />
                
                {/* Front arms/paws - one holding matchstick */}
                <div className="absolute top-11 left-1/2 -translate-x-1/2 -translate-x-3 w-2 h-4 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full"
                  style={{ 
                    boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.2)'
                  }}
                />
                {/* Paw with matchstick */}
                <div 
                  className="absolute top-11 left-1/2 -translate-x-1/2 translate-x-2 w-2 h-5 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full origin-top"
                  style={{
                    transform: 'rotate(-35deg)',
                    boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Paw pad details */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-800/60 rounded-full" />
                  
                  {/* Matchstick in paw */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 top-full w-14 h-1 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-full animate-character-strike"
                    style={{
                      animationDelay: '1.5s',
                      transformOrigin: 'left center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Match head */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gradient-radial from-red-700 via-red-600 to-red-700 rounded-full"
                      style={{ 
                        boxShadow: '0 0 4px rgba(200,0,0,0.5)'
                      }}
                    />
                    
                    {/* Flame appears after strike */}
                    <div 
                      className="absolute -right-1 -top-5 w-7 h-9 animate-flame-flicker opacity-0"
                      style={{ 
                        animationDelay: '2s',
                        animationDuration: '0.3s',
                        animationFillMode: 'forwards',
                        transformOrigin: 'bottom center'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-yellow-500 to-yellow-200 rounded-t-full blur-[2px]" 
                        style={{ 
                          boxShadow: '0 0 30px rgba(255, 165, 0, 1), 0 0 60px rgba(255, 100, 0, 0.8)' 
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-t-full blur-sm opacity-70" />
                    </div>
                  </div>
                </div>
                
                {/* Back legs */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 -translate-x-2 w-2.5 h-4 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform rotate-5"
                  style={{ 
                    boxShadow: 'inset -1px 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
                <div className="absolute top-16 left-1/2 -translate-x-1/2 translate-x-2 w-2.5 h-4 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform -rotate-5"
                  style={{ 
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
                
                {/* Feet with paw pads */}
                <div className="absolute top-19 left-1/2 -translate-x-1/2 -translate-x-2 w-3 h-2 bg-gradient-to-b from-amber-800 to-amber-900 rounded-full"
                  style={{ 
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-amber-950/40 rounded-full" />
                </div>
                <div className="absolute top-19 left-1/2 -translate-x-1/2 translate-x-2 w-3 h-2 bg-gradient-to-b from-amber-800 to-amber-900 rounded-full"
                  style={{ 
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-amber-950/40 rounded-full" />
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