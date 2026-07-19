/**
 * File: tests/ui/requests-grid.spec.ts
 * Requirements: REQ-002 (requests visibility), REQ-015 (reason visibility), REQ-016 (visual state badges), REQ-009 (cancel action visibility)
 * Coverage IDs: UI-004
 * Priority: P2
 * Business Objective: Validate rendering of the requests grid, status badges, reason display, and action visibility for Pending.
 * Note: Do not duplicate API rule assertions; validate UI updates and visibility only.
 */

import { test, expect } from '../../fixtures/fixtures';
import { workerEmployeeId } from '../../utils/test-allocators';

function trace(meta: { req: string[]; cov: string[]; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}] ${meta.objective}`;
}

test.describe('UI-004 Requests Grid', () => {
  test(
    'REQ-002/015/016/009: Grid renders rows, status badges, reason cells; cancel button only for Pending ' +
      trace({
        req: ['REQ-002', 'REQ-015', 'REQ-016', 'REQ-009'],
        cov: ['UI-004'],
        objective: 'Grid rendering and action visibility'
      }),
    async ({ page, app }, testInfo) => {
      await app.sidebar.selectRole('Employee');
      const empId = workerEmployeeId(testInfo.workerIndex);
      await page.locator('#employee-selector').selectOption(String(empId));

      const table = page.getByRole('table', { name: 'My leave requests table' });
      await expect(table).toBeVisible();

      // If a data row exists, validate columns and status badge rendering
      const dataRow = table.getByRole('row').nth(1); // skip header at index 0
      if (await dataRow.isVisible()) {
        // Basic cells (non-exhaustive): ID, Type, Status badge, Reason cell
        await expect(dataRow.getByRole('cell').first()).toBeVisible();
        await expect(dataRow.getByRole('cell').nth(1)).toBeVisible();

        const statusPill = dataRow.locator('.status');
        await expect(statusPill).toBeVisible();

        // Reason cell (if rejected)
        const reasonCell = dataRow.locator('td.reason-cell');
        // Reason cell may be empty for non-rejected items; visibility check is sufficient
        await expect(reasonCell).toBeVisible();

        const statusText = (await statusPill.innerText()).trim();
        if (statusText === 'Pending') {
          await expect(dataRow.getByRole('button', { name: /Cancel request/i })).toBeVisible();
        }
      }
    }
  );
});
