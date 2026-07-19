import { loadConfig } from '../config/index.js';

export type LogLevel = 'silent' | 'info' | 'debug';

const cfg = loadConfig();

function ts() {
  return new Date().toISOString();
}

export const logger = {
  info: (...args: unknown[]) => {
    if (cfg.logLevel === 'silent') return;
    console.log(`[INFO ${ts()}]`, ...args);
  },
  debug: (...args: unknown[]) => {
    if (cfg.logLevel !== 'debug') return;
    console.debug(`[DEBUG ${ts()}]`, ...args);
  },
  error: (...args: unknown[]) => {
    console.error(`[ERROR ${ts()}]`, ...args);
  }
};
