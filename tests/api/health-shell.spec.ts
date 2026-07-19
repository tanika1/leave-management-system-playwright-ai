/**
 * File: tests/api/health-shell.spec.ts
 * Requirements: REQ-020
 * Coverage IDs: API-001, API-002
 * Purpose: Validate Health and Shell endpoints contracts.
 * Risk Level: P3
 * Business Objective: Confirm basic service health and shell metadata for navigation/roles.
 */

import { test, expect } from '../../fixtures/fixtures';
import type { ApiClient } from '../../api/client';
import { isOk, logResponse } from '../../utils/api-helpers';

function trace(meta: { req: string[]; cov: string[]; risk: string; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}][${meta.risk}] ${meta.objective}`;
}

test.describe('Health & Shell', () => {
  test(
    'REQ-020: Health returns { status: \"ok\" } [API-001] ' +
      trace({
        req: ['REQ-020'],
        cov: ['API-001'],
        risk: 'P3',
        objective: 'Service health check'
      }),
    async ({ apiClient }: { apiClient: ApiClient }) => {
      const resp = await apiClient.health.getHealth();
      expect(isOk(resp)).toBeTruthy();
      expect(resp.data?.status).toBe('ok');
      logResponse('health', resp);
    }
  );

  test(
    'REQ-020: Shell returns navigation and roles arrays [API-002] ' +
      trace({
        req: ['REQ-020'],
        cov: ['API-002'],
        risk: 'P3',
        objective: 'Shell contract for navigation and roles'
      }),
    async ({ apiClient }: { apiClient: ApiClient }) => {
      const resp = await apiClient.health.getShell();
      expect(isOk(resp)).toBeTruthy();
      expect(Array.isArray(resp.data?.navigation ?? [])).toBeTruthy();
      expect(Array.isArray(resp.data?.roles ?? [])).toBeTruthy();
      logResponse('shell', resp);
    }
  );
});
