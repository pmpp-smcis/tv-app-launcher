import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.lojaapps',
  appName: 'Loja de Apps',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
