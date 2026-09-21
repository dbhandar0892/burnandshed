import { useState } from 'react';
import { Scissors, Flame, Laugh, Wind, Trophy } from 'lucide-react';
import { VentBox } from './tabs/VentBox';
import { BurnNote } from './tabs/BurnNote';
import { LaughBreak } from './tabs/LaughBreak';
import { BreathingReset } from './tabs/BreathingReset';
import { LetGoTracker } from './tabs/LetGoTracker';
import logo from '../assets/burn-and-shed-logo.webp';

const tabs = [
  { id: 'vent', icon: Scissors, label: 'Shed It', component: VentBox },
  { id: 'burn', icon: Flame, label: 'Burn It', component: BurnNote },
  { id: 'laugh', icon: Laugh, label: 'Laugh', component: LaughBreak },
  { id: 'breathe', icon: Wind, label: 'Breathe', component: BreathingReset },
  { id: 'tracker', icon: Trophy, label: 'Tracker', component: LetGoTracker },
];

export const MobileLayout = () => {
  const [activeTab, setActiveTab] = useState('vent');
  
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || VentBox;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto shadow-large">
      {/* Header with enhanced gradient and depth */}
      <header className="bg-gradient-calm px-6 py-5 text-center shadow-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh-calm opacity-40" />
        
        <div className="relative z-10 flex flex-col items-center">
          <img
            src={logo}
            alt="Burn & Shed"
            className="h-[7.5rem] w-auto max-w-full object-contain drop-shadow-sm"
          />
          <p className="-mt-1 text-primary-foreground/90 text-sm font-medium">Let go and feel better</p>
        </div>
      </header>

      {/* Main Content with smooth transitions */}
      <main className="flex-1 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="h-full animate-fade-in">
          <ActiveComponent />
        </div>
      </main>

      {/* Bottom Navigation with modern design */}
      <nav className="bg-card/80 backdrop-blur-lg border-t border-border/50 p-3 shadow-large">
        <div className="flex justify-between items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 flex-1 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-primary scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:scale-105'
                }`}
              >
                <Icon size={22} className={isActive ? 'animate-float' : ''} />
                <span className="text-[10px] mt-1.5 font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};