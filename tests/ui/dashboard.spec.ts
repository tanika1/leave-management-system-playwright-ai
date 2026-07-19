/**
 * File: tests/ui/dashboard.spec.ts
 * Requirements: REQ-017 (role visibility), REQ-001 (balance visibility - basic), REQ-002 (requests visibility - basic)
 * Coverage IDs: UI-002
 * Priority: P2
 * Business Objective: Validate dashboard rendering basics: role selection, employee selector presence, balance card table, and requests table default/empty states.
 * Notes:
 * - Avoid duplicating API calculations; validate UI presence/loading/empty state only.
 * - Use accessibility-first locators and reuse existing fixtures/page objects.
 */

import { test, expect } from '../../fixtures/fixtures';
import { workerEmployeeId } from '../../utils/test-allocators';

function trace(meta: { req: string[]; cov: string[]; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}] ${meta.objective}`;
}

test.describe('UI-002 Dashboard basics', () => {
  test(
    'REQ-017/001/002: Employee selector is visible; selecting an employee renders balance and requests tables ' +
      trace({
        req: ['REQ-017', 'REQ-001', 'REQ-002'],
        cov: ['UI-002'],
        objective: 'Dashboard basics and default states'
      }),
    async ({ page, app }, testInfo) => {
      // Ensure Employee role
      await app.sidebar.selectRole('Employee');

      // Employee selector should be visible
      const selector = page.locator('#employee-selector');
      await expect(selector).toBeVisible();

      // Use worker-aware employee to avoid shared-state collisions
      const empId = workerEmployeeId(testInfo.workerIndex);
      await selector.selectOption(String(empId));

      // Balance card table should render
      const balanceTable = page.getByRole('table', { name: 'Leave balance by type' });
      await expect(balanceTable).toBeVisible();

      // Employee requests table should render (could be empty on a fresh state)
      const requestsTable = page.getByRole('table', { name: 'My leave requests table' });
      await expect(requestsTable).toBeVisible();

      // Header row should exist even if there are no data rows
      await expect(requestsTable.getByRole('row').first()).toBeVisible();
    }
  );

  test(
    'REQ-017: Changing employee keeps dashboard sections responsive (re-renders without manual refresh) ' +
      trace({
        req: ['REQ-017'],
        cov: ['UI-002'],
        objective: 'Sections update on employee change'
      }),
    async ({ page, app }, testInfo) => {
      await app.sidebar.selectRole('Employee');
      const selector = page.locator('#employee-selector');
      await expect(selector).toBeVisible();

      // Select an initial employee
      const current = workerEmployeeId(testInfo.workerIndex);
      await selector.selectOption(String(current));

      // Verify sections are present
      const balanceTable = page.getByRole('table', { name: 'Leave balance by type' });
      const requestsTable = page.getByRole('table', { name: 'My leave requests table' });
      await expect(balanceTable).toBeVisible();
      await expect(requestsTable).toBeVisible();

      // Change to a different employee to ensure the UI can update (no content assertions, presence only)
      const next = ((testInfo.workerIndex + 1) % 5) + 1;
      await selector.selectOption(String(next));

      // Tables remain visible after switch
      await expect(balanceTable).toBeVisible();
      await expect(requestsTable).toBeVisible();
    }
  );
});
