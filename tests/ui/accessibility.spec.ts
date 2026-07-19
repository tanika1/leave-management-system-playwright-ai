/**
 * File: tests/ui/accessibility.spec.ts
 * Requirements: REQ-017 (labels/roles)
 * Coverage IDs: UI-007
 * Priority: P3
 * Business Objective: Validate basic accessibility heuristics: roles, labels, keyboard focus.
 */

import { test, expect } from '../../fixtures/fixtures';

function trace(meta: { req: string[]; cov: string[]; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}] ${meta.objective}`;
}

test.describe('UI-007 Accessibility basics', () => {
  test(
    'REQ-017: Navigation exposes roles/labels; key controls are keyboard reachable ' +
      trace({
        req: ['REQ-017'],
        cov: ['UI-007'],
        objective: 'Accessible roles and labels; keyboard focus basics'
      }),
    async ({ page, app }) => {
      await app.sidebar.selectRole('Employee');

      // Navigation roles/labels
      await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
      await expect(page.getByLabel(/Role/i)).toBeVisible();

      // Keyboard focus reaches a nav button
      const firstNav = page.getByRole('button', { name: /Dashboard/i });
      await firstNav.focus();
      await expect(firstNav).toBeFocused();
    }
  );
});
