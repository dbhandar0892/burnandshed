import { Sparkles, Lock, LogIn } from 'lucide-react';
import { usePremium } from '@/lib/premium';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { navigate } from '@/lib/nav';

interface Props {
  title: string;
  description: string;
  explore?: boolean;
}

export const PremiumLock = ({ title, description, explore = false }: Props) => {
  const { signedIn } = usePremium();
  return (
  <Card className="p-6 rounded-2xl border-primary/25 bg-gradient-to-br from-primary/10 to-card shadow-medium text-center space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-gradient-calm flex items-center justify-center mx-auto shadow-primary">
      <Lock className="h-7 w-7 text-primary-foreground" />
    </div>
    <div className="space-y-1.5">
      <h4 className="font-bold text-base text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
        {signedIn || explore ? description : 'Please sign in to continue using this feature.'}
      </p>
    </div>
    <Button
      onClick={() => navigate(signedIn || explore ? 'premium' : 'profile')}
      className="w-full h-12 rounded-2xl bg-gradient-calm text-primary-foreground font-bold shadow-primary hover:opacity-90"
    >
      {signedIn || explore ? <Sparkles className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
      {explore ? 'Explore Premium' : signedIn ? 'Unlock Premium' : 'Sign in to continue'}
    </Button>
  </Card>
  );
};
