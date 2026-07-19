/**
 * File: tests/api/approval-workflow.spec.ts
 * Requirements: REQ-011, REQ-012, REQ-016
 * Coverage IDs: API-009
 * Purpose: Validate approval workflow state machine and business rules (sufficient balance, conflicts).
 * Risk Level: P1 per RISK_MATRIX.md
 * Business Objective: Ensure approvals only occur from Pending and enforce balance constraints.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import type { DateFactory } from '../../utils/date-utils';
import { isOk, logResponse } from '../../utils/api-helpers';

function trace(meta: { req: string[]; cov: string[]; risk: string; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.risk}] ${meta.objective}`;
}

test.describe('API-009 Approve - State & Balance', () => {
  test(
    'REQ-011: Approve a Pending request (sufficient balance) should return 200 and set Approved ' +
      trace({
        req: ['REQ-011', 'REQ-016'],
        cov: ['API-009'],
        risk: 'P1',
        objective: 'Pending→Approved with sufficient balance'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2); // 2 weekdays
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;

      const approve = await apiClient.manager.approve(id);
      expect(approve.ok).toBeTruthy();
      expect(approve.status).toBe(200);
      expect(approve.data?.request?.status).toBe('Approved');
      logResponse('approve sufficient balance', approve);
    }
  );

  test(
    'REQ-012: Approve with insufficient balance (Casual > remaining) should return 409 ' +
      trace({
        req: ['REQ-012', 'REQ-016'],
        cov: ['API-009'],
        risk: 'P1',
        objective: 'Approval must fail when requested days exceed remainingDays'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      // Casual baseline is 5; request 6 weekdays to force insufficient balance
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 6);
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Casual',
        startDate,
        endDate,
        employeeId: 1
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;

      const approve = await apiClient.manager.approve(id);
      expect(approve.ok).toBeFalsy();
      expect(approve.status).toBe(409);
      logResponse('approve insufficient balance', approve);
    }
  );

  test(
    'REQ-016: Approving an already Approved request should return 409 (conflict) ' +
      trace({
        req: ['REQ-016'],
        cov: ['API-009'],
        risk: 'P1',
        objective: 'Disallow non-Pending transition (duplicate approve)'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 1); // 1 weekday to ensure minimal balance impact
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;

      const first = await apiClient.manager.approve(id);
      expect(first.ok).toBeTruthy();
      expect(first.data?.request?.status).toBe('Approved');

      const second = await apiClient.manager.approve(id);
      expect(second.ok).toBeFalsy();
      expect(second.status).toBe(409);
      logResponse('duplicate approve', second);
    }
  );

  test(
    'REQ-011: Approving a non-existent request ID should return 404 ' +
      trace({
        req: ['REQ-011'],
        cov: ['API-009'],
        risk: 'P1',
        objective: 'Return NotFound for unknown ID'
      }),
    async ({ apiClient }: { apiClient: ApiClient }) => {
      const approve = await apiClient.manager.approve(999999);
      expect(approve.ok).toBeFalsy();
      expect(approve.status).toBe(404);
      logResponse('approve not found', approve);
    }
  );
});
