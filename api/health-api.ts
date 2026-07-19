import { BaseApiClient } from './base-api';
import { ENDPOINTS } from '../constants/endpoints';
import type { ApiResponse } from '../models/api';
import type { HealthResponse, ShellState } from '../models';

export class HealthApi extends BaseApiClient {
  async getHealth(): Promise<ApiResponse<HealthResponse>> {
    return this.get<HealthResponse>(ENDPOINTS.HEALTH);
  }

  async getShell(): Promise<ApiResponse<ShellState>> {
    return this.get<ShellState>(ENDPOINTS.SHELL);
  }
}
