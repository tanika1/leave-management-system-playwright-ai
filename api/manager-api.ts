import { BaseApiClient } from './base-api';
import { ENDPOINTS } from '../constants/endpoints';
import type { ApiResponse } from '../models/api';
import type { LeaveRequestRecord } from '../models/types';

export class ManagerApi extends BaseApiClient {
  async listRequests(): Promise<ApiResponse<LeaveRequestRecord[]>> {
    return this.get<LeaveRequestRecord[]>(ENDPOINTS.MANAGER.REQUESTS);
  }

  async approve(id: number): Promise<ApiResponse<{ message?: string; request?: LeaveRequestRecord }>> {
    return this.post(ENDPOINTS.MANAGER.APPROVE(id));
  }

  async reject(id: number, reason: string): Promise<ApiResponse<{ message?: string; request?: LeaveRequestRecord }>> {
    return this.post(ENDPOINTS.MANAGER.REJECT(id), { reason });
  }
}
