/**
 * File: tests/api/balance.spec.ts
 * Requirements: REQ-001, REQ-008, REQ-012, REQ-013
 * Coverage IDs: API-004
 * Purpose: Validate balance integrity: only Approved consume balance; unpaid unlimited; delta checks.
 * Risk Level: P1
 * Business Objective: Ensure entitlement calculations and deltas are correct and consistent with approvals.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import type { DateFactory } from '../../utils/date-utils';
import { isOk, logResponse } from '../../utils/api-helpers';

function trace(meta: { req: string[]; cov: string[]; risk: string; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.risk}] ${meta.objective}`;
}

function getTypeEntry(breakdown: { leaveType: string; usedDays: number; baselineDays: number; remainingDays: number | null; isUnlimited: boolean }[], type: string) {
  const entry = breakdown.find(b => b.leaveType === type);
  if (!entry) throw new Error(`Missing balance entry for type ${type}`);
  return entry;
}

test.describe('API-004 Balance Integrity', () => {
  test(
    'REQ-001/008/012: Approving limited-type leave increases usedDays and decreases remainingDays by days approved ' +
      trace({
        req: ['REQ-001', 'REQ-008', 'REQ-012'],
        cov: ['API-004'],
        risk: 'P1',
        objective: 'Only Approved consume balance; validate delta for limited types'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const employeeId = 1;

      const before = await apiClient.employee.getBalance(employeeId);
      expect(isOk(before)).toBeTruthy();

      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2); // 2 weekdays
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;
      const days = submit.data?.request?.days as number;

      // No consumption on Pending (REQ-008)
      const mid = await apiClient.employee.getBalance(employeeId);
      expect(isOk(mid)).toBeTruthy();
      const beforeAnnual = getTypeEntry(before.data!, 'Annual');
      const midAnnual = getTypeEntry(mid.data!, 'Annual');
      expect(midAnnual.usedDays).toBe(beforeAnnual.usedDays);

      const approve = await apiClient.manager.approve(id);
      expect(approve.ok).toBeTruthy();
      logResponse('approve for balance delta', approve);

      const after = await apiClient.employee.getBalance(employeeId);
      expect(isOk(after)).toBeTruthy();
      const afterAnnual = getTypeEntry(after.data!, 'Annual');

      // Delta checks
      expect(afterAnnual.usedDays).toBe(beforeAnnual.usedDays + days);
      expect(afterAnnual.remainingDays).toBe((beforeAnnual.remainingDays ?? 0) - days);
    }
  );

  test(
    'REQ-001/013: Unpaid is unlimited; approval should not produce a finite remainingDays; usedDays accumulates for reporting ' +
      trace({
        req: ['REQ-001', 'REQ-013'],
        cov: ['API-004'],
        risk: 'P1',
        objective: 'Unpaid unlimited: remainingDays stays null; usedDays sums Approved'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const employeeId = 1;

      const before = await apiClient.employee.getBalance(employeeId);
      expect(isOk(before)).toBeTruthy();
      const beforeUnpaid = getTypeEntry(before.data!, 'Unpaid');
      expect(beforeUnpaid.isUnlimited).toBe(true);
      expect(beforeUnpaid.remainingDays).toBeNull();

      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 3); // 3 weekdays
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Unpaid',
        startDate,
        endDate,
        employeeId
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;
      const days = submit.data?.request?.days as number;

      const approve = await apiClient.manager.approve(id);
      expect(approve.ok).toBeTruthy();
      logResponse('approve unpaid', approve);

      const after = await apiClient.employee.getBalance(employeeId);
      expect(isOk(after)).toBeTruthy();
      const afterUnpaid = getTypeEntry(after.data!, 'Unpaid');

      expect(afterUnpaid.isUnlimited).toBe(true);
      expect(afterUnpaid.remainingDays).toBeNull();
      expect(afterUnpaid.usedDays).toBe(beforeUnpaid.usedDays + days);
    }
  );
});
