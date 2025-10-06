import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Scissors } from 'lucide-react';
import { toast } from 'sonner';

export const VentBox = () => {
  const [text, setText] = useState('');
  const [isShedding, setIsShedding] = useState(false);

  const handleShed = () => {
    if (!text.trim()) {
      toast.error('Write something to shed first!');
      return;
    }

    setIsShedding(true);
    
    // Play shedding sound effect (simulated)
    toast.success('🍃 Shed away and released!');
    
    // Increment tracker count in localStorage
    const currentCount = parseInt(localStorage.getItem('shedCount') || '0');
    localStorage.setItem('shedCount', (currentCount + 1).toString());
    
    // Clear after animation
    setTimeout(() => {
      setText('');
      setIsShedding(false);
    }, 1200);
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

      {/* Text Input */}
      <div className="flex-1 space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your frustrations here... Let it all out!"
          className={`min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none transition-all text-2xl ${
            isShedding ? 'animate-shed' : ''
          }`}
          disabled={isShedding}
        />
        
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