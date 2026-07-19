// Strongly typed domain models and enums for the LMS
// These complement constants/enums.ts by offering enum-style representations

export enum ManagerAction {
  Approve = 'Approve',
  Reject = 'Reject'
}

export interface HealthResponse {
  status: string;
}

export interface Employee {
  id: number;
  name: string;
}

export interface LeaveBalance {
  usedDays: number;
  remainingDays: number; // for Unpaid, remainingDays usage is undefined in API; prefer LeaveTypeBalance for UI
}

export interface LeaveTypeBalanceUI {
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
  isUnlimited: boolean;
  baselineDays: number;
  usedDays: number;
  remainingDays: number | null;
}
