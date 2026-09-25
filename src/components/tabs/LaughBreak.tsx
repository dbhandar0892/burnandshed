import { useState } from 'react';
import { logActivity } from '@/lib/activity';
import { nextJoke, splitJoke } from '@/lib/jokes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Laugh, RefreshCw } from 'lucide-react';

export const LaughBreak = () => {
  const [currentJoke, setCurrentJoke] = useState(() => nextJoke());

  const getNewJoke = () => {
    setCurrentJoke(nextJoke());
    logActivity('laugh');
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent-foreground/20 rounded-2xl flex items-center justify-center mx-auto animate-float shadow-medium">
          <Laugh className="h-10 w-10 text-accent-foreground" />
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Laugh Break</h2>
        <p className="text-muted-foreground text-base font-medium">A little humor to brighten your mood</p>
      </div>

      {/* Joke Card */}
      <div className="flex-1 flex items-center justify-center px-2">
        <Card className="p-10 bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-large max-w-md mx-auto rounded-3xl backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.02]">
          <div className="text-center space-y-6">
            <div className="text-7xl animate-float">😄</div>
            <p className="text-xl text-foreground leading-relaxed font-semibold">
              {currentJoke}
            </p>
          </div>
        </Card>
      </div>

      {/* Next Joke Button */}
      <div className="space-y-4">
        <Button
          onClick={getNewJoke}
          className="w-full bg-gradient-to-r from-accent to-primary text-white hover:shadow-large hover:scale-[1.02] h-16 text-lg font-bold rounded-2xl shadow-medium transition-all duration-300"
        >
          <RefreshCw className="mr-3 h-6 w-6" />
          Next Joke
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground font-medium">
            😊 Laughter is the best medicine. Take as much as you need!
          </p>
        </div>
      </div>
    </div>
  );
};
