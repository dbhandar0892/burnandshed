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
  "I used to hate facial hair, but then it grew on me.",
  "What do you call a fish wearing a bowtie? Sofishticated!",
  "Why did the cookie go to the doctor? Because it felt crumbly!",
  "What did the ocean say to the beach? Nothing, it just waved.",
  "Why do seagulls fly over the sea? Because if they flew over the bay, they'd be bagels!",
  "What do you call a can opener that doesn't work? A can't opener!",
  "Why did the tomato turn red? Because it saw the salad dressing!",
  "What do you call a pile of cats? A meowtain!",
  "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
  "What's orange and sounds like a parrot? A carrot!",
  "Why don't skeletons fight each other? They don't have the guts!",
  "What did one wall say to the other wall? I'll meet you at the corner!",
  "Why did the student eat his homework? Because the teacher said it was a piece of cake!",
  "What do you call a snowman with a six-pack? An abdominal snowman!",
  "Why did the computer go to the doctor? Because it had a virus!",
  "What do you call a belt made of watches? A waist of time!",
  "Why don't oysters donate to charity? Because they're shellfish!",
  "What did the janitor say when he jumped out of the closet? Supplies!",
  "Why did the coffee file a police report? It got mugged!",
  "What do you call a factory that makes okay products? A satisfactory!",
  "Why did the invisible man turn down the job offer? He couldn't see himself doing it!",
  "What do you call a dog magician? A labracadabrador!",
  "Why don't scientists trust stairs? Because they're always up to something!",
  "What did the grape say when it got stepped on? Nothing, it just let out a little wine!",
  "Why did the picture go to jail? Because it was framed!",
  "What do you call a parade of rabbits hopping backwards? A receding hare-line!",
  "Why did the mushroom go to the party? Because he was a fungi!",
  "What do you call a bear in the rain? A drizzly bear!",
  "Why don't calendars ever go on vacation? Because their days are numbered!",
  "What did the zero say to the eight? Nice belt!",
  "Why did the banana go to the doctor? Because it wasn't peeling well!",
  "What do you call a cheese that isn't yours? Nacho cheese!",
  "Why did the gym close down? It just didn't work out!",
  "What do you call a sleeping dinosaur? A dino-snore!",
  "Why did the smartphone need glasses? It lost all its contacts!",
  "What do you call a group of musical whales? An orca-stra!",
  "Why did the math teacher break up with the calculator? She felt he was just using her!",
  "What do you call a sad coffee? A depresso!",
  "Why did the belt get arrested? For holding up a pair of pants!",
  "What do you call a alligator in a vest? An investigator!",
  "Why don't elephants use computers? They're afraid of the mouse!",
  "What did the buffalo say to his son when he left? Bison!",
  "Why did the bicycle fall over? Because it was two-tired!",
  "What do you call a fake stone? A shamrock!",
  "Why did the scarecrow become a successful neurosurgeon? He was outstanding in his field!",
  "What do you call a bear with no ears? B!",
  "Why don't pirates shower before they walk the plank? They'll just wash up on shore later!",
  "What did the left eye say to the right eye? Between us, something smells!",
  "Why did the stadium get hot after the game? All the fans left!",
  "What do you call a cow with no legs? Ground beef!",
  "Why did the frog take the bus to work? His car got toad away!",
  "What do you call a dinosaur with an extensive vocabulary? A thesaurus!",
  "Why did the nurse need a red pen? In case she needed to draw blood!",
  "What do you call a fly without wings? A walk!",
  "Why did the phone wear glasses? Because it lost all its contacts!",
  "What do you call a train carrying bubblegum? A chew-chew train!",
  "Why did the kid bring a ladder to school? Because she wanted to go to high school!",
  "What do you call a nervous javelin thrower? Shakespeare!",
  "Why did the chicken join a band? Because it had the drumsticks!",
  "What do you call a boomerang that won't come back? A stick!",
  "Why did the cookie cry? Because his mother was a wafer so long!",
  "What do you call a sleeping pizza? A piZZZa!",
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