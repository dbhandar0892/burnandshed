import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Laugh, RefreshCw } from 'lucide-react';

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why don't programmers like nature? It has too many bugs.",
  "What do you call a fake noodle? An impasta!",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
  "Why did the math book look so sad? Because it had too many problems!",
  "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!",
  "Why can't a bicycle stand up by itself? It's two tired!",
  "What do you call a sleeping bull? A bulldozer!",
  "Why don't scientists trust atoms? Because they make up everything!",
  "I used to hate facial hair, but then it grew on me.",
];

export const LaughBreak = () => {
  const [currentJoke, setCurrentJoke] = useState(
    jokes[Math.floor(Math.random() * jokes.length)]
  );

  const getNewJoke = () => {
    let newJoke;
    do {
      newJoke = jokes[Math.floor(Math.random() * jokes.length)];
    } while (newJoke === currentJoke && jokes.length > 1);
    
    setCurrentJoke(newJoke);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto animate-float">
          <Laugh className="h-8 w-8 text-success-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Laugh Break</h2>
        <p className="text-muted-foreground">A little humor to brighten your mood</p>
      </div>

      {/* Joke Card */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-8 bg-card border-border shadow-medium max-w-sm mx-auto">
          <div className="text-center space-y-6">
            <div className="text-6xl">😄</div>
            <p className="text-lg text-foreground leading-relaxed font-medium">
              {currentJoke}
            </p>
          </div>
        </Card>
      </div>

      {/* Next Joke Button */}
      <div className="space-y-4">
        <Button
          onClick={getNewJoke}
          className="w-full bg-gradient-success text-success-foreground hover:opacity-90 h-14 text-lg font-semibold rounded-lg shadow-soft"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Next Joke
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            😊 Laughter is the best medicine. Take as much as you need!
          </p>
        </div>
      </div>
    </div>
  );
};