import type { ComponentType } from 'react';
import { usePremium } from '@/lib/premium';
import { PremiumLock } from '@/components/PremiumLock';

export const withPremium = (Inner: ComponentType, heading: string, title: string, description: string) => {
  const Gated = () => {
    const premium = usePremium();
    if (premium.active) return <Inner />;
    return (
      <div className="space-y-6 py-4">
        <h2 className="text-3xl font-bold text-foreground tracking-tight text-center">{heading}</h2>
        <PremiumLock title={title} description={description} />
      </div>
    );
  };
  return Gated;
};
