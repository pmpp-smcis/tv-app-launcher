import { registerPlugin } from '@capacitor/core';

export interface AppInstallCheckerPlugin {
  /**
   * Check if an app is installed by package name
   */
  isAppInstalled(options: { packageName: string }): Promise<{ installed: boolean }>;
  
  /**
   * Check multiple apps at once
   */
  checkMultipleApps(options: { packageNames: string[] }): Promise<{ results: Record<string, boolean> }>;
  
  /**
   * Get list of all installed apps (optional, can be heavy)
   */
  getInstalledApps(): Promise<{ packages: string[] }>;
}

const AppInstallChecker = registerPlugin<AppInstallCheckerPlugin>('AppInstallChecker', {
  web: () => import('./web').then(m => new m.AppInstallCheckerWeb()),
});

export default AppInstallChecker;
