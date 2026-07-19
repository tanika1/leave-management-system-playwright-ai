export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Cancelled' | 'Rejected';
export type UserRole = 'Employee' | 'Manager';

export const ROLES: UserRole[] = ['Employee', 'Manager'];
export const LEAVE_TYPES: LeaveType[] = ['Annual', 'Sick', 'Casual', 'Unpaid'];
export const STATUSES: LeaveRequestStatus[] = ['Pending', 'Approved', 'Cancelled', 'Rejected'];
