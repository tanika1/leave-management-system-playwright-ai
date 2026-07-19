import type { FullConfig } from '@playwright/test';
import { loadConfig } from '../config/index.js';

export default async function globalSetup(_config: FullConfig) {
  const cfg = loadConfig();
  console.log(`[GlobalSetup] App: ${cfg.appBaseUrl} | API: ${cfg.apiBaseUrl}`);
}
