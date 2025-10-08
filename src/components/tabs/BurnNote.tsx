import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';

export const BurnNote = () => {
  const [text, setText] = useState('');
  const [isBurning, setIsBurning] = useState(false);

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
    const totalDuration = matchstickDuration + (chars * charBurnDuration) + 1200;
    
    // Play burning sound effect (simulated)
    setTimeout(() => {
      toast.success('🔥 Burned to ashes and released!');
    }, matchstickDuration);
    
    // Increment tracker count in localStorage
    const currentCount = parseInt(localStorage.getItem('burnCount') || '0');
    localStorage.setItem('burnCount', (currentCount + 1).toString());
    
    // Clear after animation
    setTimeout(() => {
      setText('');
      setIsBurning(false);
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