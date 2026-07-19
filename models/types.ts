import type { LeaveType, LeaveRequestStatus, UserRole } from '../constants/enums';

export interface EmployeeRecord { id: number; name: string; }

export interface LeaveRequestInput {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  leaveType: LeaveType;
  employeeId: number;
}

export interface RejectionInput { reason: string }

export interface LeaveRequestRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  days: number;
  status: LeaveRequestStatus;
  reason?: string | null;
}

export interface LeaveTypeBalance {
  leaveType: LeaveType;
  isUnlimited: boolean;
  baselineDays: number;
  usedDays: number;
  remainingDays: number | null;
}

export interface ShellState { navigation: string[]; roles: UserRole[] }
