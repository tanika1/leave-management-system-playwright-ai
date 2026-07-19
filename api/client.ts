import { EmployeeApi } from './employee-api';
import { HealthApi } from './health-api';
import { LeaveRequestApi } from './leave-request-api';
import { ManagerApi } from './manager-api';

export interface ApiFacade {
  health: HealthApi;
  employee: EmployeeApi;
  leaveRequest: LeaveRequestApi;
  manager: ManagerApi;
  dispose: () => Promise<void>;
}

export async function createApiClient(): Promise<ApiFacade> {
  const health = await new HealthApi().init();
  const employee = await new EmployeeApi().init();
  const leaveRequest = await new LeaveRequestApi().init();
  const manager = await new ManagerApi().init();

  return {
    health,
    employee,
    leaveRequest,
    manager,
    dispose: async () => {
      await Promise.all([
        health.dispose(),
        employee.dispose(),
        leaveRequest.dispose(),
        manager.dispose()
      ]);
    }
  };
}

export type ApiClient = Awaited<ReturnType<typeof createApiClient>>;
