import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Scissors } from 'lucide-react';
import { toast } from 'sonner';

export const VentBox = () => {
  const [text, setText] = useState('');
  const [isShredding, setIsShredding] = useState(false);

  const handleShred = () => {
    if (!text.trim()) {
      toast.error('Write something to shred first!');
      return;
    }

    setIsShredding(true);
    
    // Play shredding sound effect (simulated)
    toast.success('📄 Shredded and gone forever!');
    
    // Increment tracker count in localStorage
    const currentCount = parseInt(localStorage.getItem('shredCount') || '0');
    localStorage.setItem('shredCount', (currentCount + 1).toString());
    
    // Clear after animation
    setTimeout(() => {
      setText('');
      setIsShredding(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-float">
          <Scissors className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Vent Box</h2>
        <p className="text-muted-foreground">Write what's bothering you, then shred it away</p>
      </div>

      {/* Text Input */}
      <div className="flex-1 space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your frustrations here... Let it all out!"
          className={`min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none transition-all ${
            isShredding ? 'animate-shred' : ''
          }`}
          disabled={isShredding}
        />
        
        <Button
          onClick={handleShred}
          disabled={isShredding || !text.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-semibold rounded-lg shadow-soft"
        >
          {isShredding ? (
            <>
              <Scissors className="mr-2 h-5 w-5 animate-spin" />
              Shredding...
            </>
          ) : (
            <>
              <Scissors className="mr-2 h-5 w-5" />
              Shred It Away
            </>
          )}
        </Button>
      </div>

      {/* Privacy Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your words are never saved. Complete privacy guaranteed.
        </p>
      </div>
    </div>
  );
};