import { useState } from 'react';
import { Scissors, Flame, Laugh, Wind, Trophy } from 'lucide-react';
import { VentBox } from './tabs/VentBox';
import { BurnNote } from './tabs/BurnNote';
import { LaughBreak } from './tabs/LaughBreak';
import { BreathingReset } from './tabs/BreathingReset';
import { LetGoTracker } from './tabs/LetGoTracker';

const tabs = [
  { id: 'vent', icon: Scissors, label: 'Shred It', component: VentBox },
  { id: 'burn', icon: Flame, label: 'Burn It', component: BurnNote },
  { id: 'laugh', icon: Laugh, label: 'Laugh', component: LaughBreak },
  { id: 'breathe', icon: Wind, label: 'Breathe', component: BreathingReset },
  { id: 'tracker', icon: Trophy, label: 'Tracker', component: LetGoTracker },
];

export const MobileLayout = () => {
  const [activeTab, setActiveTab] = useState('vent');
  
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || VentBox;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-gradient-calm p-6 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-white">Forget About It</h1>
        <p className="text-white/80 text-sm mt-1">Let go and feel better</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ActiveComponent />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border p-2">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-soft' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};