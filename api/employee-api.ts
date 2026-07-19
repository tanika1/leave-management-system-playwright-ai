import { BaseApiClient } from './base-api';
import { ENDPOINTS } from '../constants/endpoints';
import type { ApiResponse } from '../models/api';
import type { EmployeeRecord, LeaveRequestRecord, LeaveTypeBalance } from '../models/types';

export class EmployeeApi extends BaseApiClient {
  async listEmployees(): Promise<ApiResponse<EmployeeRecord[]>> {
    return this.get<EmployeeRecord[]>(ENDPOINTS.EMPLOYEES);
  }

  async getBalance(employeeId: number): Promise<ApiResponse<LeaveTypeBalance[]>> {
    return this.get<LeaveTypeBalance[]>(ENDPOINTS.EMPLOYEE.BALANCE, { params: { employeeId } });
  }

  async listRequests(employeeId: number): Promise<ApiResponse<LeaveRequestRecord[]>> {
    return this.get<LeaveRequestRecord[]>(ENDPOINTS.EMPLOYEE.REQUESTS, { params: { employeeId } });
  }
}
