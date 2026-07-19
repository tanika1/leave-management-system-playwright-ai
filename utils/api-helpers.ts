import type { ApiResponse } from '../models/api';
import { logger } from './logger';

export function isOk<T>(resp: ApiResponse<T>): resp is ApiResponse<NonNullable<T>> & { ok: true } {
  return !!resp && resp.ok === true && resp.status >= 200 && resp.status < 300;
}

export function logResponse<T>(label: string, resp: ApiResponse<T>) {
  const base = { status: resp.status, ok: resp.ok };
  if (resp.ok) {
    logger.info(label, base);
  } else {
    logger.error(label, { ...base, error: resp.error });
  }
}
