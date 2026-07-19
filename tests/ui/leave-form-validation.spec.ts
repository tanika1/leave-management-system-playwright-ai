/**
 * File: tests/ui/leave-form-validation.spec.ts
 * Requirements: REQ-003 (UI submit presence), REQ-004/005/006/007 (client-side validation only)
 * Coverage IDs: UI-003
 * Priority: P1
 * Business Objective: Validate UI form behavior: required fields, leave type selection, client-side error feedback,
 *                    submit button behavior, and success/feedback notification mapping.
 * Note: Avoid duplicating backend rule assertions; verify UI controls, interactions, and visible feedback only.
 */

import { test, expect } from '../../fixtures/fixtures';
import { workerEmployeeId } from '../../utils/test-allocators';

function trace(meta: { req: string[]; cov: string[]; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}] ${meta.objective}`;
}

test.describe('UI-003 Leave Request Form - Client UI validation', () => {
  test(
    'REQ-003/004/005/006/007: Controls exist; missing/invalid inputs show feedback; submit triggers visible status ' +
      trace({
        req: ['REQ-003', 'REQ-004', 'REQ-005', 'REQ-006', 'REQ-007'],
        cov: ['UI-003'],
        objective: 'Client-side validation and visible feedback mapping'
      }),
    async ({ page, app, dateFactory }, testInfo) => {
      await app.sidebar.selectRole('Employee');

      // Use worker-aware employee to avoid shared-state collisions
      const empId = workerEmployeeId(testInfo.workerIndex);
      const employeeSelector = page.locator('#employee-selector');
      await expect(employeeSelector).toBeVisible();
      await employeeSelector.selectOption(String(empId));

      const form = page.locator('form[aria-label="Leave request form"]');
      await expect(form).toBeVisible();

      const leaveType = page.locator('#leave-type');
      const startDate = page.locator('#start-date');
      const endDate = page.locator('#end-date');
      const submitBtn = page.getByRole('button', { name: 'Submit Request' });

      // Controls present
      await expect(leaveType).toBeVisible();
      await expect(startDate).toBeVisible();
      await expect(endDate).toBeVisible();
      await expect(submitBtn).toBeVisible();

      // Attempt submit with required fields missing -> UI feedback element visible
      await submitBtn.click();
      const feedback = page.locator('.feedback');
      await expect(feedback).toBeVisible();

      // Fill minimal valid values and submit to observe status/notification mapping
      const { startDate: s, endDate: e } = dateFactory.rangeWeekdays(1, 1);
      await leaveType.selectOption('Annual');
      await startDate.fill(s);
      await endDate.fill(e);
      await submitBtn.click();

      // Expect a visible status region (success/error message surfaced by UI) — not asserting backend outcome here
      await expect(page.getByRole('status')).toBeVisible();
    }
  );
});
