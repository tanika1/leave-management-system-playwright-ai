export const ENDPOINTS = {
  HEALTH: '/api/health',
  SHELL: '/api/shell',
  EMPLOYEES: '/api/employees',
  EMPLOYEE: {
    BALANCE: '/api/employee/balance',
    REQUESTS: '/api/employee/leave-requests',
    CANCEL: (id: number) => `/api/employee/leave-requests/${id}/cancel`
  },
  MANAGER: {
    REQUESTS: '/api/manager/leave-requests',
    APPROVE: (id: number) => `/api/manager/leave-requests/${id}/approve`,
    REJECT: (id: number) => `/api/manager/leave-requests/${id}/reject`
  }
} as const;
