import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';

// Emotion detection based on keywords
const detectEmotion = (word: string): 'anger' | 'sadness' | 'fear' | 'neutral' => {
  const lowerWord = word.toLowerCase();
  
  const angerWords = ['hate', 'angry', 'mad', 'furious', 'rage', 'pissed', 'annoyed', 'frustrated', 'irritated', 'damn', 'hell', 'stupid', 'idiot', 'terrible', 'worst', 'awful'];
  const sadnessWords = ['sad', 'depressed', 'lonely', 'hurt', 'pain', 'crying', 'tears', 'miserable', 'hopeless', 'empty', 'lost', 'alone', 'heartbroken'];
  const fearWords = ['scared', 'afraid', 'anxious', 'worried', 'panic', 'terrified', 'nervous', 'stress', 'fear', 'overwhelming'];
  
  if (angerWords.some(w => lowerWord.includes(w))) return 'anger';
  if (sadnessWords.some(w => lowerWord.includes(w))) return 'sadness';
  if (fearWords.some(w => lowerWord.includes(w))) return 'fear';
  
  return 'neutral';
};

// Flame color schemes based on emotion
const getFlameColors = (emotion: 'anger' | 'sadness' | 'fear' | 'neutral') => {
  switch (emotion) {
    case 'anger':
      return {
        core: 'from-red-100 via-orange-200',
        coreGlow: '0 0 40px rgba(255, 50, 50, 1), 0 0 60px rgba(255, 100, 0, 1), 0 0 100px rgba(255, 0, 0, 0.8)',
        middle: 'from-red-500 via-orange-400',
        middleGlow: '0 0 50px rgba(255, 0, 0, 1), 0 0 80px rgba(255, 69, 0, 0.9)',
        outer: 'from-red-700 via-red-600',
        outerGlow: '0 0 60px rgba(139, 0, 0, 0.9)',
        ember: 'rgba(255, 0, 0, 1)',
        emberGlow: '0 0 20px rgba(255, 0, 0, 1), 0 0 35px rgba(200, 0, 0, 0.8)'
      };
    case 'sadness':
      return {
        core: 'from-blue-100 via-cyan-200',
        coreGlow: '0 0 40px rgba(100, 150, 255, 1), 0 0 60px rgba(50, 100, 255, 1), 0 0 100px rgba(0, 100, 255, 0.8)',
        middle: 'from-blue-400 via-cyan-300',
        middleGlow: '0 0 50px rgba(0, 100, 255, 1), 0 0 80px rgba(0, 150, 255, 0.9)',
        outer: 'from-blue-600 via-blue-500',
        outerGlow: '0 0 60px rgba(0, 50, 150, 0.9)',
        ember: 'rgba(50, 150, 255, 1)',
        emberGlow: '0 0 20px rgba(50, 150, 255, 1), 0 0 35px rgba(0, 100, 200, 0.8)'
      };
    case 'fear':
      return {
        core: 'from-purple-100 via-violet-200',
        coreGlow: '0 0 40px rgba(200, 100, 255, 1), 0 0 60px rgba(150, 50, 255, 1), 0 0 100px rgba(128, 0, 255, 0.8)',
        middle: 'from-purple-400 via-violet-300',
        middleGlow: '0 0 50px rgba(128, 0, 255, 1), 0 0 80px rgba(150, 0, 255, 0.9)',
        outer: 'from-purple-600 via-purple-500',
        outerGlow: '0 0 60px rgba(75, 0, 130, 0.9)',
        ember: 'rgba(150, 50, 255, 1)',
        emberGlow: '0 0 20px rgba(150, 50, 255, 1), 0 0 35px rgba(100, 0, 200, 0.8)'
      };
    default: // neutral - original orange/yellow
      return {
        core: 'from-white via-yellow-100',
        coreGlow: '0 0 40px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 230, 0, 1), 0 0 100px rgba(255, 200, 0, 0.8)',
        middle: 'from-orange-400 via-orange-300',
        middleGlow: '0 0 50px rgba(255, 140, 0, 1), 0 0 80px rgba(255, 100, 0, 0.9)',
        outer: 'from-red-500 via-orange-500',
        outerGlow: '0 0 60px rgba(255, 69, 0, 0.9)',
        ember: 'rgba(255, 140, 0, 1)',
        emberGlow: '0 0 20px rgba(255, 140, 0, 1), 0 0 35px rgba(255, 100, 0, 0.8)'
      };
  }
};

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
    const matchstickDuration = 300; // Quick matchstick animation
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
    <div className="h-full flex flex-col p-6 space-y-8">
      {/* Header with enhanced styling */}
      <div className="text-center space-y-3 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-fire rounded-2xl flex items-center justify-center mx-auto animate-float shadow-fire">
          <Flame className="h-10 w-10 text-white drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Burn It Note</h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
          Transform your anger into smoke and let it drift away
        </p>
      </div>

      {/* Text Input */}
      <div className="flex-1 space-y-4">
        {isBurning ? (
          <div className="min-h-[200px] bg-card border border-border rounded-md p-3 overflow-hidden relative">
            {/* Matchstick Animation */}
            <div 
              className="absolute bottom-2 right-2 z-10 animate-matchstick-light"
              style={{ transformOrigin: 'top left' }}
            >
              <div className="relative w-2 h-16 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm">
                {/* Matchstick head */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full" />
                {/* Flame on matchstick */}
                <div 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-7 animate-flame-flicker"
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
              {text.split(' ').map((word, wordIndex) => {
                const emotion = detectEmotion(word);
                const colors = getFlameColors(emotion);
                
                return (
                  <span key={wordIndex}>
                    {word.split('').map((char, charIndex) => {
                      const matchstickDelay = 300;
                      const totalCharsBefore = text.split(' ').slice(0, wordIndex).join(' ').length + wordIndex;
                      const absoluteCharIndex = totalCharsBefore + charIndex;
                      const reverseIndex = text.length - 1 - absoluteCharIndex;
                      const charDelay = matchstickDelay + (reverseIndex * 80);
                      
                      return (
                        <span key={charIndex} className="relative inline-block">
                          {/* Multi-layered realistic flame effect with emotion colors */}
                          <span
                            className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-40 pointer-events-none opacity-0"
                            style={{
                              animationDelay: `${charDelay - 100}ms`,
                              animation: 'flame-appear 1.2s ease-out forwards',
                            }}
                          >
                            {/* Inner bright core */}
                            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-24 bg-gradient-to-t ${colors.core} to-transparent rounded-t-full blur-[2px]`}
                              style={{ 
                                boxShadow: colors.coreGlow,
                                animation: 'flame-flicker-core 0.15s ease-in-out infinite alternate'
                              }}
                            />
                            {/* Middle layer */}
                            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-32 bg-gradient-to-t ${colors.middle} to-transparent rounded-t-full blur-[3px]`}
                              style={{ 
                                boxShadow: colors.middleGlow,
                                animation: 'flame-flicker-mid 0.2s ease-in-out infinite alternate-reverse'
                              }}
                            />
                            {/* Outer layer */}
                            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-36 bg-gradient-to-t ${colors.outer} to-transparent rounded-t-full blur-[4px] opacity-90`}
                              style={{ 
                                boxShadow: colors.outerGlow,
                                animation: 'flame-flicker-outer 0.25s ease-in-out infinite'
                              }}
                            />
                          </span>
                          
                          {/* Ember particles with emotion colors */}
                          {[0, 1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className="absolute -bottom-4 left-1/2 w-2 h-2 rounded-full pointer-events-none opacity-0"
                              style={{
                                animationDelay: `${charDelay + 150 + (i * 80)}ms`,
                                animation: 'ember-rise 1.5s ease-out forwards',
                                left: `${50 + (i - 2) * 15}%`,
                                background: colors.ember,
                                boxShadow: colors.emberGlow
                              }}
                            />
                          ))}
                          
                          {/* Smoke particles */}
                          {[0, 1].map((i) => (
                            <span
                              key={`smoke-${i}`}
                              className="absolute -top-2 left-1/2 w-4 h-4 rounded-full pointer-events-none opacity-0"
                              style={{
                                animationDelay: `${charDelay + 400 + (i * 200)}ms`,
                                animation: 'smoke-rise 2s ease-out forwards',
                                left: `${50 + (i - 0.5) * 30}%`,
                                background: 'rgba(100, 100, 100, 0.5)',
                                filter: 'blur(4px)'
                              }}
                            />
                          ))}
                          
                          {/* Character that burns */}
                          <span
                            className="inline-block animate-burn-letter"
                            style={{
                              animationDelay: `${charDelay}ms`,
                              animationDuration: '1.2s',
                              animationFillMode: 'forwards',
                              filter: `drop-shadow(0 0 8px ${colors.ember.replace('1)', '0.8)')})`,
                            }}
                          >
                            {char}
                          </span>
                        </span>
                      );
                    })}
                    {wordIndex < text.split(' ').length - 1 && ' '}
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
          className="w-full bg-gradient-fire text-white hover:opacity-90 h-16 text-lg font-bold rounded-2xl shadow-fire transition-all duration-300 hover:shadow-large hover:scale-[1.02]"
        >
          {isBurning ? (
            <>
              <Flame className="mr-2 h-6 w-6 animate-pulse" />
              Burning...
            </>
          ) : (
            <>
              <Flame className="mr-2 h-6 w-6" />
              Burn It Away
            </>
          )}
        </Button>
      </div>

      {/* Privacy Note */}
      <div className="text-center mt-auto pt-4">
        <p className="text-sm text-muted-foreground font-medium">
          🔒 Your words turn to smoke. Nothing is saved or stored.
        </p>
      </div>
    </div>
  );
};