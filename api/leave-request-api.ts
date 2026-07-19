import { BaseApiClient } from './base-api';
import { ENDPOINTS } from '../constants/endpoints';
import type { ApiResponse } from '../models/api';
import type { LeaveRequestInput, LeaveRequestRecord, LeaveTypeBalance } from '../models/types';

export class LeaveRequestApi extends BaseApiClient {
  async submit(input: LeaveRequestInput): Promise<ApiResponse<{ message?: string; request?: LeaveRequestRecord; balanceBreakdown?: LeaveTypeBalance[] }>> {
    return this.post(ENDPOINTS.EMPLOYEE.REQUESTS, input);
  }

  async cancel(id: number, employeeId: number): Promise<ApiResponse<{ message?: string; request?: LeaveRequestRecord }>> {
    return this.post(ENDPOINTS.EMPLOYEE.CANCEL(id), undefined, { params: { employeeId } });
  }
}
