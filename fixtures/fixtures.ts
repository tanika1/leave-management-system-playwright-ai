import { test as base, expect } from '@playwright/test';
import { createApiClient, type ApiClient } from '../api/client';
import { createDateFactory, type DateFactory } from '../utils/date-utils';
import { AppShellPage } from '../pages/app-shell';
import { loadConfig } from '../config';

/**
 * Map worker index to a unique employeeId (1..5) to avoid shared-state collisions.
 * worker 0 -> 1, 1 -> 2, 2 -> 3, 3 -> 4, 4 -> 5, wrap beyond 5.
 */
function workerEmployeeId(workerIndex: number): number {
  return (workerIndex % 5) + 1;
}

/**
 * Wrap ApiFacade methods to transparently remap employeeId=1 to a worker-specific id.
 * This preserves test intent (tests often use employeeId=1 by default) while ensuring
 * parallel isolation. We only override when the provided employeeId === 1.
 */
function withEmployeeIsolation(api: ApiClient, mappedId: number): ApiClient {
  const employee = {
    ...api.employee,
    getBalance: async (employeeId: number) => {
      const useId = employeeId === 1 ? mappedId : employeeId;
      return api.employee.getBalance(useId);
    },
    listRequests: async (employeeId: number) => {
      const useId = employeeId === 1 ? mappedId : employeeId;
      return api.employee.listRequests(useId);
    },
    listEmployees: async () => {
      return api.employee.listEmployees();
    }
  };

  const leaveRequest = {
    ...api.leaveRequest,
    submit: async (input: any) => {
      const payload = { ...input, employeeId: input?.employeeId === 1 ? mappedId : input?.employeeId };
      return api.leaveRequest.submit(payload);
    },
    cancel: async (id: number, employeeId: number) => {
      const useId = employeeId === 1 ? mappedId : employeeId;
      return api.leaveRequest.cancel(id, useId);
    }
  };

  // Manager and Health APIs do not use employeeId; pass through.
  return {
    ...api,
    employee: employee as any,
    leaveRequest: leaveRequest as any
  };
}

export const test = base.extend<{
  apiClient: ApiClient;
  dateFactory: DateFactory;
  testData: Record<string, unknown>;
  app: AppShellPage;
}>({
  apiClient: async (
    {},
    use: (api: ApiClient) => Promise<void>,
    testInfo
  ) => {
    const api = await createApiClient();
    const mappedId = workerEmployeeId(testInfo.workerIndex);
    const isolated = withEmployeeIsolation(api, mappedId);
    await use(isolated);
    await api.dispose();
  },
  dateFactory: async (
    {},
    use: (df: DateFactory) => Promise<void>
  ) => {
    await use(createDateFactory());
  },
  testData: async (
    {},
    use: (data: Record<string, unknown>) => Promise<void>
  ) => {
    await use({});
  },
  app: async (
    { page }: { page: import('@playwright/test').Page },
    use: (app: AppShellPage) => Promise<void>
  ) => {
    const cfg = loadConfig();
    const app = new AppShellPage(page);
    await app.open(cfg.appBaseUrl);
    await use(app);
  }
});

export { expect };
