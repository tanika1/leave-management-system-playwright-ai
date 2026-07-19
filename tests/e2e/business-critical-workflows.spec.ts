/**
 * File: tests/e2e/business-critical-workflows.spec.ts
 * Scope: Critical business end-to-end workflows only (non-duplicative with API/UI layer tests)
 * Coverage IDs: E2E-001, E2E-002, E2E-003
 * Priority: P1
 * Business Objective:
 * - Validate complete employee↔manager workflows with UI + backend synchronization.
 * - Prove business confidence on approve/reject/cancel outcomes and balance semantics.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import type { LeaveRequestRecord } from '../../models/types';
import type { LeaveType } from '../../constants/enums';
import { workerEmployeeId } from '../../utils/test-allocators';
import { AppShellPage } from '../../pages/app-shell';
import { EmployeeDashboardPage } from '../../pages/employee-dashboard-page';
import { ManagerDashboardPage } from '../../pages/manager-dashboard-page';

function trace(meta: {
  e2e: string;
  req: string[];
  cov: string[];
  priority: 'P1' | 'P2' | 'P3';
  objective: string;
}) {
  return `[${meta.e2e}][${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.priority}] ${meta.objective}`;
}

async function getRemaining(
  apiClient: ApiClient,
  employeeId: number,
  leaveType: LeaveType
): Promise<number | null> {
  const balance = await apiClient.employee.getBalance(employeeId);
  expect(balance.ok).toBeTruthy();
  const row = balance.data?.find((b) => b.leaveType === leaveType);
  expect(row).toBeTruthy();
  return row?.remainingDays ?? null;
}

async function listEmployeeRequests(apiClient: ApiClient, employeeId: number): Promise<LeaveRequestRecord[]> {
  const list = await apiClient.employee.listRequests(employeeId);
  expect(list.ok).toBeTruthy();
  return list.data ?? [];
}

async function findNewlySubmittedRequest(
  apiClient: ApiClient,
  employeeId: number,
  criteria: Pick<LeaveRequestRecord, 'leaveType' | 'startDate' | 'endDate'>,
  existingIds: Set<number>
): Promise<LeaveRequestRecord> {
  await expect
    .poll(async () => {
      const list = await listEmployeeRequests(apiClient, employeeId);
      return (
        list
          .filter(
            (r) =>
              !existingIds.has(r.id) &&
              r.employeeId === employeeId &&
              r.leaveType === criteria.leaveType &&
              r.startDate === criteria.startDate &&
              r.endDate === criteria.endDate
          )
          .sort((a, b) => b.id - a.id)[0] ?? null
      );
    })
    .not.toBeNull();

  const list = await listEmployeeRequests(apiClient, employeeId);
  const request =
    list
      .filter(
        (r) =>
          !existingIds.has(r.id) &&
          r.employeeId === employeeId &&
          r.leaveType === criteria.leaveType &&
          r.startDate === criteria.startDate &&
          r.endDate === criteria.endDate
      )
      .sort((a, b) => b.id - a.id)[0] ?? null;

  expect(request).toBeTruthy();
  return request as LeaveRequestRecord;
}

async function findRequestById(
  apiClient: ApiClient,
  employeeId: number,
  requestId: number
): Promise<LeaveRequestRecord> {
  await expect
    .poll(async () => {
      const list = await listEmployeeRequests(apiClient, employeeId);
      return list.find((r) => r.id === requestId) ?? null;
    })
    .not.toBeNull();

  const list = await listEmployeeRequests(apiClient, employeeId);
  const request = list.find((r) => r.id === requestId) ?? null;
  expect(request).toBeTruthy();
  return request as LeaveRequestRecord;
}

async function switchToEmployee(app: AppShellPage, employeeId: number) {
  await app.sidebar.selectRole('Employee');
  await app.employeeSelector.selectById(employeeId);
}

async function waitForRequestRowVisible(
  table: EmployeeDashboardPage['requestsTable'] | ManagerDashboardPage['requestsTable'],
  requestId: number
) {
  await expect(table.rowByRequestId(requestId)).toBeVisible({ timeout: 15_000 });
}

test.describe('Critical Business E2E Workflows', () => {
  test(
    'E2E-001: Employee submits Sick leave → Manager approves → Employee sees Approved and decremented balance ' +
      trace({
        e2e: 'E2E-001',
        req: ['REQ-001', 'REQ-003', 'REQ-008', 'REQ-011', 'REQ-012', 'REQ-016'],
        cov: ['E2E-001'],
        priority: 'P1',
        objective: 'Approval lifecycle and balance decrement for limited leave type'
      }),
    async ({ page, app, apiClient, dateFactory }, testInfo) => {
      const employeeId = workerEmployeeId(testInfo.workerIndex);
      const employeePage = new EmployeeDashboardPage(page);
      const managerPage = new ManagerDashboardPage(page);

      await switchToEmployee(app, employeeId);

      const beforeRemaining = await getRemaining(apiClient, employeeId, 'Sick');
      const beforeUiRemaining = await employeePage.balanceCard.getRemaining('Sick');

      const range = dateFactory.rangeWeekdays(1, 1);
      const existingIds = new Set((await listEmployeeRequests(apiClient, employeeId)).map((r) => r.id));

      await employeePage.requestForm.chooseLeaveType('Sick');
      await employeePage.requestForm.setStartDate(range.startDate);
      await employeePage.requestForm.setEndDate(range.endDate);
      await employeePage.requestForm.submit();

      const submitted = await findNewlySubmittedRequest(
        apiClient,
        employeeId,
        {
          leaveType: 'Sick',
          startDate: range.startDate,
          endDate: range.endDate
        },
        existingIds
      );

      await waitForRequestRowVisible(employeePage.requestsTable, submitted.id);
      await expect(employeePage.requestsTable.statusPill(submitted.id)).toHaveText(/Pending/i, { timeout: 15_000 });

      await app.sidebar.selectRole('Manager');
      await waitForRequestRowVisible(managerPage.requestsTable, submitted.id);
      await managerPage.approvalDialog.approve(submitted.id);
      await expect(managerPage.requestsTable.statusPill(submitted.id)).toHaveText(/Approved/i, { timeout: 15_000 });

      await switchToEmployee(app, employeeId);
      await waitForRequestRowVisible(employeePage.requestsTable, submitted.id);
      await expect(employeePage.requestsTable.statusPill(submitted.id)).toHaveText(/Approved/i, { timeout: 15_000 });

      const approved = await findRequestById(apiClient, employeeId, submitted.id);
      expect(approved.status).toBe('Approved');

      const afterRemaining = await getRemaining(apiClient, employeeId, 'Sick');
      expect(beforeRemaining).not.toBeNull();
      expect(afterRemaining).not.toBeNull();
      expect(afterRemaining).toBe((beforeRemaining as number) - approved.days);

      const afterUiRemaining = await employeePage.balanceCard.getRemaining('Sick');
      expect(afterUiRemaining).not.toBe(beforeUiRemaining);
    }
  );

  test(
    'E2E-002: Employee submits leave → Manager rejects with reason → Employee sees reason and unchanged balance ' +
      trace({
        e2e: 'E2E-002',
        req: ['REQ-003', 'REQ-008', 'REQ-014', 'REQ-015', 'REQ-016'],
        cov: ['E2E-002'],
        priority: 'P1',
        objective: 'Rejection lifecycle with persisted reason and non-consuming balance behavior'
      }),
    async ({ page, app, apiClient, dateFactory }, testInfo) => {
      const employeeId = workerEmployeeId(testInfo.workerIndex);
      const employeePage = new EmployeeDashboardPage(page);
      const managerPage = new ManagerDashboardPage(page);

      await switchToEmployee(app, employeeId);

      const beforeRemaining = await getRemaining(apiClient, employeeId, 'Casual');
      const range = dateFactory.rangeWeekdays(2, 1);
      const existingIds = new Set((await listEmployeeRequests(apiClient, employeeId)).map((r) => r.id));

      await employeePage.requestForm.chooseLeaveType('Casual');
      await employeePage.requestForm.setStartDate(range.startDate);
      await employeePage.requestForm.setEndDate(range.endDate);
      await employeePage.requestForm.submit();

      const submitted = await findNewlySubmittedRequest(
        apiClient,
        employeeId,
        {
          leaveType: 'Casual',
          startDate: range.startDate,
          endDate: range.endDate
        },
        existingIds
      );

      const reason = `Insufficient staffing plan for request ${submitted.id}`;

      await app.sidebar.selectRole('Manager');
      await waitForRequestRowVisible(managerPage.requestsTable, submitted.id);
      await managerPage.rejectionDialog.startReject(submitted.id);
      await managerPage.rejectionDialog.confirmReject(submitted.id, reason);
      await expect(managerPage.requestsTable.statusPill(submitted.id)).toHaveText(/Rejected/i, { timeout: 15_000 });

      await switchToEmployee(app, employeeId);
      await waitForRequestRowVisible(employeePage.requestsTable, submitted.id);
      await expect(employeePage.requestsTable.statusPill(submitted.id)).toHaveText(/Rejected/i, { timeout: 15_000 });
      await expect(employeePage.requestsTable.reasonCell(submitted.id)).toContainText(reason);

      const rejected = await findRequestById(apiClient, employeeId, submitted.id);
      expect(rejected.status).toBe('Rejected');
      expect(rejected.reason ?? '').toContain(reason);

      const afterRemaining = await getRemaining(apiClient, employeeId, 'Casual');
      expect(afterRemaining).toBe(beforeRemaining);
    }
  );

  test(
    'E2E-003: Employee submits leave → Employee cancels before manager action ' +
      trace({
        e2e: 'E2E-003',
        req: ['REQ-003', 'REQ-008', 'REQ-009', 'REQ-016'],
        cov: ['E2E-003'],
        priority: 'P1',
        objective: 'Pending cancellation by owner and non-consuming balance behavior'
      }),
    async ({ page, app, apiClient, dateFactory }, testInfo) => {
      const employeeId = workerEmployeeId(testInfo.workerIndex);
      const employeePage = new EmployeeDashboardPage(page);
      const managerPage = new ManagerDashboardPage(page);

      await switchToEmployee(app, employeeId);

      const beforeRemaining = await getRemaining(apiClient, employeeId, 'Sick');
      const range = dateFactory.rangeWeekdays(3, 1);
      const existingIds = new Set((await listEmployeeRequests(apiClient, employeeId)).map((r) => r.id));

      await employeePage.requestForm.chooseLeaveType('Sick');
      await employeePage.requestForm.setStartDate(range.startDate);
      await employeePage.requestForm.setEndDate(range.endDate);
      await employeePage.requestForm.submit();

      const submitted = await findNewlySubmittedRequest(
        apiClient,
        employeeId,
        {
          leaveType: 'Sick',
          startDate: range.startDate,
          endDate: range.endDate
        },
        existingIds
      );

      await waitForRequestRowVisible(employeePage.requestsTable, submitted.id);
      await expect(employeePage.requestsTable.statusPill(submitted.id)).toHaveText(/Pending/i, { timeout: 15_000 });

      await employeePage.requestsTable.actionButton(submitted.id, `Cancel request ${submitted.id}`).click();
      await expect(employeePage.requestsTable.statusPill(submitted.id)).toHaveText(/Cancelled/i, { timeout: 15_000 });

      const cancelled = await findRequestById(apiClient, employeeId, submitted.id);
      expect(cancelled.status).toBe('Cancelled');

      await app.sidebar.selectRole('Manager');
      await waitForRequestRowVisible(managerPage.requestsTable, submitted.id);
      await expect(managerPage.requestsTable.statusPill(submitted.id)).toHaveText(/Cancelled/i, { timeout: 15_000 });

      const afterRemaining = await getRemaining(apiClient, employeeId, 'Sick');
      expect(afterRemaining).toBe(beforeRemaining);
    }
  );
});
