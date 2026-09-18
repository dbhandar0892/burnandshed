import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b46f57453a914fdf912484aec13eba7c',
  appName: 'Burn & Shed',
  webDir: 'dist',
  server: {
    url: 'https://b46f5745-3a91-4fdf-9124-84aec13eba7c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      showSpinner: false
    }
  }
};

export default config;