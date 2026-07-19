/**
 * File: tests/api/rejection-workflow.spec.ts
 * Requirements: REQ-014, REQ-015, REQ-016
 * Coverage IDs: API-010
 * Purpose: Validate rejection workflow (Pending-only, reason required, reason persistence).
 * Risk Level: P1
 * Business Objective: Ensure managers can reject only Pending with a non-empty reason and that reason persists.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import type { DateFactory } from '../../utils/date-utils';
import { isOk, logResponse } from '../../utils/api-helpers';

function trace(meta: { req: string[]; cov: string[]; risk: string; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.risk}] ${meta.objective}`;
}

test.describe('API-010 Reject - Validation & State', () => {
  test(
    'REQ-014/015: Reject Pending with non-empty reason → 200 Rejected and reason persisted ' +
      trace({
        req: ['REQ-014', 'REQ-015', 'REQ-016'],
        cov: ['API-010'],
        risk: 'P1',
        objective: 'Pending→Rejected with reason; reason visible in records'
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

      const reject = await apiClient.manager.reject(id, 'Team unavailable');
      expect(reject.ok).toBeTruthy();
      expect(reject.status).toBe(200);
      expect(reject.data?.request?.status).toBe('Rejected');
      expect(reject.data?.request?.reason).toBe('Team unavailable');
      logResponse('reject success', reject);

      // Verify reason persistence via manager list as an additional data visibility check
      const list = await apiClient.manager.listRequests();
      expect(list.ok).toBeTruthy();
      const rec = list.data?.find(r => r.id === id);
      expect(rec?.status).toBe('Rejected');
      expect(rec?.reason).toBe('Team unavailable');
    }
  );

  test(
    'REQ-014: Reject with empty/whitespace reason should return 400 ' +
      trace({
        req: ['REQ-014'],
        cov: ['API-010'],
        risk: 'P1',
        objective: 'Rejection reason must be non-empty and not whitespace'
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

      const reject = await apiClient.manager.reject(id, '   ');
      expect(reject.ok).toBeFalsy();
      expect(reject.status).toBe(400);
      logResponse('reject empty reason', reject);
    }
  );

  test(
    'REQ-016: Reject a non-Pending request should return 409 ' +
      trace({
        req: ['REQ-016'],
        cov: ['API-010'],
        risk: 'P1',
        objective: 'Disallow rejection when status is not Pending'
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

      // Approve first to move out of Pending
      const approve = await apiClient.manager.approve(id);
      expect(approve.ok).toBeTruthy();

      const reject = await apiClient.manager.reject(id, 'Post-approval reject should fail');
      expect(reject.ok).toBeFalsy();
      expect(reject.status).toBe(409);
      logResponse('reject not pending', reject);
    }
  );

  test(
    'REQ-014: Reject unknown request id should return 404 ' +
      trace({
        req: ['REQ-014'],
        cov: ['API-010'],
        risk: 'P1',
        objective: 'Return NotFound for unknown id'
      }),
    async ({ apiClient }: { apiClient: ApiClient }) => {
      const reject = await apiClient.manager.reject(999999, 'not found');
      expect(reject.ok).toBeFalsy();
      expect(reject.status).toBe(404);
      logResponse('reject not found', reject);
    }
  );
});
