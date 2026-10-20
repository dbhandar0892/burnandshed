import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b46f57453a914fdf912484aec13eba7c',
  appName: 'Burn & Shed',
  webDir: 'dist',
  // Release builds load the bundled webDir, never a development preview URL.
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      showSpinner: false
    }
  }
};

export default config;