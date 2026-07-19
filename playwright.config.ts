import { defineConfig, devices } from '@playwright/test';
import { loadConfig } from './config/env';

const cfg = loadConfig();

export default defineConfig({
  globalSetup: './hooks/global-setup.ts',
  globalTeardown: './hooks/global-teardown.ts',
  // Root-level testDir can remain broad; per-project testDir will scope discovery correctly.
  testDir: 'tests',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }]
  ],
  outputDir: 'artifacts',
  projects: [
    // API-only tests
    {
      name: 'api',
      testDir: 'tests/api',
      use: {
        baseURL: cfg.apiBaseUrl,
        trace: 'off',
        screenshot: 'off',
        video: 'off'
      }
    },
    // UI-only tests
    {
      name: 'ui',
      testDir: 'tests/ui',
      use: {
        baseURL: cfg.appBaseUrl,
        ...devices['Desktop Chrome'],
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off'
      }
    },
    // E2E tests (keep reserved path for future use)
    {
      name: 'e2e',
      testDir: 'tests/e2e',
      use: {
        baseURL: cfg.appBaseUrl,
        ...devices['Desktop Chrome'],
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off'
      }
    }
  ],
});
