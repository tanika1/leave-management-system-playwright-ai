import type { ApiResponse } from '../models/api';

export function hasStatus<T>(response: ApiResponse<T>, status: number): boolean {
  return response.status === status;
}

export function hasMessage<T>(response: ApiResponse<T>): boolean {
  return Boolean(response.error && typeof response.error === 'object' && 'message' in response.error);
}

export function isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { ok: true } {
  return response.ok;
}
