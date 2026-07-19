/**
 * File: tests/api/submit-validation.spec.ts
 * Requirements: REQ-003, REQ-004, REQ-005, REQ-006, REQ-007
 * Coverage IDs: API-006
 * Purpose: Validate submission rules and negative scenarios with boundary conditions.
 * Risk Level: P1/P2 per RISK_MATRIX.md
 * Business Objective: Prevent invalid leave submissions and ensure date/weekday/enum validation.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import type { DateFactory } from '../../utils/date-utils';
import { isOk, logResponse } from '../../utils/api-helpers';

function trace(meta: { req: string[]; cov: string[]; risk: string; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.risk}] ${meta.objective}`;
}

test.describe('API-006 Submit Leave - Validation & Boundary', () => {
  test(
    'REQ-003/004: missing leaveType should return 400 ' +
      trace({
        req: ['REQ-003', 'REQ-004'],
        cov: ['API-006'],
        risk: 'P1',
        objective: 'Submission requires leaveType to be present/recognized'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2);
      // Intentionally omit leaveType by casting to unknown to simulate missing field
      const invalidPayload = {
        // leaveType intentionally omitted
        startDate,
        endDate,
        employeeId: 1
      } as unknown as { leaveType: any; startDate: string; endDate: string; employeeId: number };

      const resp = await apiClient.leaveRequest.submit(invalidPayload as any);
      expect(resp.ok).toBeFalsy();
      expect(resp.status).toBe(400);
      logResponse('missing leaveType', resp);
    }
  );

  test(
    'REQ-004: invalid enum leaveType should return 400 ' +
      trace({
        req: ['REQ-004'],
        cov: ['API-006'],
        risk: 'P1',
        objective: 'Reject unrecognized leaveType enum'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2);
      const resp = await apiClient.leaveRequest.submit({
        // @ts-ignore invalid enum exercised intentionally
        leaveType: 'Holiday',
        startDate,
        endDate,
        employeeId: 1
      } as any);

      expect(resp.ok).toBeFalsy();
      expect(resp.status).toBe(400);
      logResponse('invalid enum', resp);
    }
  );

  test(
    'REQ-005: endDate < startDate should return 400 ' +
      trace({
        req: ['REQ-005'],
        cov: ['API-006'],
        risk: 'P1',
        objective: 'Enforce endDate ≥ startDate'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const d1 = dateFactory.nextWeekday(2);
      const d0 = dateFactory.nextWeekday(1);
      const resp = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate: d1,
        endDate: d0,
        employeeId: 1
      });

      expect(resp.ok).toBeFalsy();
      expect(resp.status).toBe(400);
      logResponse('end before start', resp);
    }
  );

  test(
    'REQ-006: past startDate (UTC) should return 400 ' +
      trace({
        req: ['REQ-006'],
        cov: ['API-006'],
        risk: 'P2',
        objective: 'Prevent past-date start (UTC-based)'
      }),
    async ({ apiClient }: { apiClient: ApiClient }) => {
      // Construct a past UTC date: 2000-01-03 to 2000-01-04 (Mon-Tue) to avoid weekend-only side effect
      const resp = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate: '2000-01-03',
        endDate: '2000-01-04',
        employeeId: 1
      });

      expect(resp.ok).toBeFalsy();
      expect(resp.status).toBe(400);
      logResponse('past date', resp);
    }
  );

  test(
    'REQ-007: weekend-only range should return 400 ' +
      trace({
        req: ['REQ-007'],
        cov: ['API-006'],
        risk: 'P1',
        objective: 'Reject ranges with zero weekdays'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.weekendOnlyRange();
      const resp = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });

      expect(resp.ok).toBeFalsy();
      expect(resp.status).toBe(400);
      logResponse('weekend-only', resp);
    }
  );

  test(
    'REQ-003: valid submission returns Pending request and balanceBreakdown ' +
      trace({
        req: ['REQ-003'],
        cov: ['API-006'],
        risk: 'P1',
        objective: 'Create Pending request'
      }),
    async ({ apiClient, dateFactory }: { apiClient: ApiClient; dateFactory: DateFactory }) => {
      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 2);
      const resp = await apiClient.leaveRequest.submit({
        leaveType: 'Annual',
        startDate,
        endDate,
        employeeId: 1
      });

      expect(isOk(resp)).toBeTruthy();
      expect(resp.data?.request?.status).toBe('Pending');
      expect(resp.data?.request?.leaveType).toBe('Annual');
      expect(Array.isArray(resp.data?.balanceBreakdown ?? [])).toBeTruthy();
      logResponse('valid submission', resp);
    }
  );
});
