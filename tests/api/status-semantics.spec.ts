/**
 * File: tests/api/status-semantics.spec.ts
 * Requirements: REQ-019
 * Coverage IDs: API-006, API-007, API-009, API-010
 * Purpose: Validate HTTP status semantics across key negative paths (400/403/404/409).
 * Risk Level: P2
 * Business Objective: Ensure consistent API contracts for error handling.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import type { DateFactory } from '../../utils/date-utils';
import { isOk, logResponse } from '../../utils/api-helpers';

function trace(meta: { req: string[]; cov: string[]; risk: string; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.risk}] ${meta.objective}`;
}

test.describe('REQ-019 Status Semantics', () => {
  test(
    'API-006: 400 validation error on invalid enum leaveType',
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2);
      const resp = await apiClient.leaveRequest.submit({
        // @ts-ignore intentional invalid enum
        leaveType: 'Holiday',
        startDate,
        endDate,
        employeeId: 1
      } as any);
      expect(resp.ok).toBeFalsy();
      expect(resp.status).toBe(400);
      logResponse('semantics-400-invalid-enum', resp);
    }
  );

  test(
    'API-007: 403 Forbid when non-owner cancels',
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 1);
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;

      const cancel = await apiClient.leaveRequest.cancel(id, 2);
      expect(cancel.ok).toBeFalsy();
      expect(cancel.status).toBe(403);
      logResponse('semantics-403-unauthorized-cancel', cancel);
    }
  );

  test(
    'API-009: 404 NotFound on approve unknown id',
    async ({ apiClient }: { apiClient: ApiClient }) => {
      const approve = await apiClient.manager.approve(999999);
      expect(approve.ok).toBeFalsy();
      expect(approve.status).toBe(404);
      logResponse('semantics-404-approve-notfound', approve);
    }
  );

  test(
    'API-009: 409 Conflict on duplicate approve or not-pending',
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 1);
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

      const second = await apiClient.manager.approve(id);
      expect(second.ok).toBeFalsy();
      expect(second.status).toBe(409);
      logResponse('semantics-409-duplicate-approve', second);
    }
  );

  test(
    'API-010: 400 on reject with empty reason; 409 on reject not-pending; 404 on reject unknown',
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 1);
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;

      const emptyReason = await apiClient.manager.reject(id, '   ');
      expect(emptyReason.ok).toBeFalsy();
      expect(emptyReason.status).toBe(400);
      logResponse('semantics-400-empty-reject', emptyReason);

      const approve = await apiClient.manager.approve(id);
      expect(approve.ok).toBeTruthy();

      const rejectNotPending = await apiClient.manager.reject(id, 'should fail');
      expect(rejectNotPending.ok).toBeFalsy();
      expect(rejectNotPending.status).toBe(409);
      logResponse('semantics-409-reject-notpending', rejectNotPending);

      const rejectUnknown = await apiClient.manager.reject(999999, 'nope');
      expect(rejectUnknown.ok).toBeFalsy();
      expect(rejectUnknown.status).toBe(404);
      logResponse('semantics-404-reject-notfound', rejectUnknown);
    }
  );
});
