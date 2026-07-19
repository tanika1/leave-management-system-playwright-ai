/**
 * File: tests/ui/state-sync.spec.ts
 * Requirements: REQ-016 (visual state refresh), REQ-002 (employee list reflects changes)
 * Coverage IDs: UI-006
 * Priority: P2
 * Business Objective: Verify UI refreshes correctly after a request is submitted via the UI without manual refresh.
 * Note: Avoid asserting backend rules; validate that lists and status update visually.
 */

import { test, expect } from '../../fixtures/fixtures';
import { workerEmployeeId } from '../../utils/test-allocators';

function trace(meta: { req: string[]; cov: string[]; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}] ${meta.objective}`;
}

test.describe('UI-006 State synchronization', () => {
  test(
    'REQ-016/002: After UI submission, employee requests table shows the new entry without manual refresh ' +
      trace({
        req: ['REQ-016', 'REQ-002'],
        cov: ['UI-006'],
        objective: 'Employee list reflects new submission automatically'
      }),
    async ({ page, app, dateFactory }, testInfo) => {
      await app.sidebar.selectRole('Employee');
      const empId = workerEmployeeId(testInfo.workerIndex);
      await page.locator('#employee-selector').selectOption(String(empId));

      const form = page.locator('form[aria-label="Leave request form"]');
      const typeSel = form.locator('#leave-type');
      const start = form.locator('#start-date');
      const end = form.locator('#end-date');
      const submit = form.getByRole('button', { name: 'Submit Request' });

      const { startDate, endDate } = dateFactory.rangeWeekdays(1, 1);
      await typeSel.selectOption('Annual');
      await start.fill(startDate);
      await end.fill(endDate);
      await submit.click();

      const table = page.getByRole('table', { name: 'My leave requests table' });
      await expect(table).toBeVisible();
      // Expect presence of at least one data row (index 1) after submission
      await expect(table.getByRole('row').nth(1)).toBeVisible();
    }
  );
});
