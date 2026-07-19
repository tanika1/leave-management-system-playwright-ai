import dotenv from 'dotenv';

dotenv.config();

export type FrameworkConfig = {
  appBaseUrl: string;
  apiBaseUrl: string;
  reportDir: string;
  artifactsDir: string;
  logLevel: 'silent' | 'info' | 'debug';
};

let cached: FrameworkConfig | null = null;

export function loadConfig(): FrameworkConfig {
  if (cached) return cached;

  const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5173';
  const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:5000';
  const reportDir = process.env.REPORT_DIR ?? 'reports';
  const artifactsDir = process.env.ARTIFACTS_DIR ?? 'artifacts';
  const logLevel = (process.env.LOG_LEVEL as FrameworkConfig['logLevel']) ?? 'info';

  cached = { appBaseUrl, apiBaseUrl, reportDir, artifactsDir, logLevel };
  return cached;
}
