import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.titaniumgym.app',
  appName: 'Titanium Gym',
  webDir: 'dist',
  server: {
    // Solo para desarrollo local - comentar en producción
    // url: 'http://localhost:5173',
    // cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#000000',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#B71C1C',
    },
  },
};

export default config;
