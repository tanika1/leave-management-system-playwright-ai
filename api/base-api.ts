import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { loadConfig } from '../config';
import { logger } from '../utils/logger';
import type { ApiResponse, ErrorMessage, ValidationError } from '../models/api';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

export class BaseApiClient {
  protected ctx!: APIRequestContext;
  protected readonly baseUrl: string;
  protected defaultHeaders: Record<string, string> = {};

  constructor(baseUrl?: string) {
    const cfg = loadConfig();
    this.baseUrl = baseUrl ?? cfg.apiBaseUrl;
  }

  async init(): Promise<this> {
    this.ctx = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: this.defaultHeaders
    });
    return this;
  }

  async dispose(): Promise<void> {
    if (this.ctx) await this.ctx.dispose();
  }

  setAuthToken(token: string): this {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`
    };
    return this;
  }

  clearAuthToken(): this {
    const { Authorization, ...rest } = this.defaultHeaders;
    void Authorization;
    this.defaultHeaders = rest;
    return this;
  }

  protected queryString(params?: RequestOptions['params']): string {
    if (!params) return '';
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) q.append(key, String(value));
    }
    const encoded = q.toString();
    return encoded ? `?${encoded}` : '';
  }

  protected async parse<T>(resp: APIResponse): Promise<ApiResponse<T>> {
    const status = resp.status();
    const ok = resp.ok();

    let payload: unknown = null;
    try {
      payload = await resp.json();
    } catch {
      try {
        const text = await resp.text();
        payload = text ? ({ message: text } as ErrorMessage) : null;
      } catch {
        payload = null;
      }
    }

    if (ok) {
      return {
        status,
        ok,
        data: (payload as T) ?? null,
        error: null
      };
    }

    return {
      status,
      ok,
      data: null,
      error: (payload as ValidationError | ErrorMessage | null) ?? { message: 'Unknown API error' }
    };
  }

  protected async get<T>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>> {
    logger.debug('API GET', path, opts?.params ?? '');
    const resp = await this.ctx.get(`${path}${this.queryString(opts?.params)}`, {
      headers: { ...this.defaultHeaders, ...(opts?.headers ?? {}) }
    });
    return this.parse<T>(resp);
  }

  protected async post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<ApiResponse<T>> {
    logger.debug('API POST', path, body ?? '');
    const resp = await this.ctx.post(`${path}${this.queryString(opts?.params)}`, {
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...(opts?.headers ?? {})
      }
    });
    return this.parse<T>(resp);
  }
}
