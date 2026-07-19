/**
 * File: tests/api/cancellation-workflow.spec.ts
 * Requirements: REQ-009, REQ-016
 * Coverage IDs: API-007
 * Purpose: Validate cancellation workflow: owner-only, Pending-only, not found, and success path.
 * Risk Level: P1
 * Business Objective: Ensure only owners can cancel Pending requests and state machine is enforced.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import type { DateFactory } from '../../utils/date-utils';
import { isOk, logResponse } from '../../utils/api-helpers';

function trace(meta: { req: string[]; cov: string[]; risk: string; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.risk}] ${meta.objective}`;
}

test.describe('API-007 Cancel - Ownership & State', () => {
  test(
    'REQ-009: Owner cancels a Pending request → 200 Cancelled ' +
      trace({
        req: ['REQ-009', 'REQ-016'],
        cov: ['API-007'],
        risk: 'P1',
        objective: 'Owner-only and Pending-only cancellation'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2);
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;

      const cancel = await apiClient.leaveRequest.cancel(id, 1);
      expect(cancel.ok).toBeTruthy();
      expect(cancel.status).toBe(200);
      expect(cancel.data?.request?.status).toBe('Cancelled');
      logResponse('cancel success', cancel);
    }
  );

  test(
    'REQ-009: Not owner attempting cancellation → 403 Forbid ' +
      trace({
        req: ['REQ-009'],
        cov: ['API-007'],
        risk: 'P1',
        objective: 'Unauthorized cancellation must be forbidden'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2);
      const submit = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });
      expect(isOk(submit)).toBeTruthy();
      const id = submit.data?.request?.id as number;

      // Attempt as employeeId=2 (not owner)
      const cancel = await apiClient.leaveRequest.cancel(id, 2);
      expect(cancel.ok).toBeFalsy();
      expect(cancel.status).toBe(403);
      logResponse('cancel unauthorized', cancel);
    }
  );

  test(
    'REQ-016: Cancel a non-Pending request → 409 Conflict ' +
      trace({
        req: ['REQ-016'],
        cov: ['API-007'],
        risk: 'P1',
        objective: 'Disallow cancellation when not Pending'
      }),
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

      const approve = await apiClient.manager.approve(id);
      expect(approve.ok).toBeTruthy();

      const cancel = await apiClient.leaveRequest.cancel(id, 1);
      expect(cancel.ok).toBeFalsy();
      expect(cancel.status).toBe(409);
      logResponse('cancel not pending', cancel);
    }
  );

  test(
    'REQ-009: Cancel an unknown request → 404 Not Found ' +
      trace({
        req: ['REQ-009'],
        cov: ['API-007'],
        risk: 'P1',
        objective: 'Return 404 for unknown request id'
      }),
    async ({ apiClient }: { apiClient: ApiClient }) => {
      const cancel = await apiClient.leaveRequest.cancel(999999, 1);
      expect(cancel.ok).toBeFalsy();
      expect(cancel.status).toBe(404);
      logResponse('cancel not found', cancel);
    }
  );
});
