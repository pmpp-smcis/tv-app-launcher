import { WebPlugin } from '@capacitor/core';
import type { AppInstallCheckerPlugin } from './AppInstallChecker';

export class AppInstallCheckerWeb extends WebPlugin implements AppInstallCheckerPlugin {
  async isAppInstalled(options: { packageName: string }): Promise<{ installed: boolean }> {
    console.log('Web platform - cannot check installed apps', options);
    // No web, sempre retorna false
    return { installed: false };
  }

  async checkMultipleApps(options: { packageNames: string[] }): Promise<{ results: Record<string, boolean> }> {
    console.log('Web platform - cannot check installed apps', options);
    const results: Record<string, boolean> = {};
    options.packageNames.forEach(pkg => {
      results[pkg] = false;
    });
    return { results };
  }

  async getInstalledApps(): Promise<{ packages: string[] }> {
    console.log('Web platform - cannot get installed apps');
    return { packages: [] };
  }
}
