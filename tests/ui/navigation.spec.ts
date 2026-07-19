/**
 * File: tests/ui/navigation.spec.ts
 * Requirements: REQ-017
 * Coverage IDs: UI-001
 * Priority: P2
 * Business Objective: Verify role-based navigation and immediate updates on role switch.
 */

import { test, expect } from '../../fixtures/fixtures';
import { AppShellPage } from '../../pages/app-shell';

function trace(meta: { req: string[]; cov: string[]; objective: string }) {
  return `[${meta.req.join(', ')}][${meta.cov.join(', ')}] ${meta.objective}`;
}

test.describe('UI-001 Navigation - Role-based visibility', () => {
  test(
    'REQ-017: Employee sees Employee menus; Manager sees Manager menus; switching updates navigation ' +
      trace({
        req: ['REQ-017'],
        cov: ['UI-001'],
        objective: 'Role switch updates visible navigation immediately'
      }),
    async ({ page, app }) => {
      // Employee role by default, verify Employee nav
      await app.sidebar.selectRole('Employee');
      await expect(page.getByRole('button', { name: 'My Leave Requests' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Team Leave Requests' })).toHaveCount(0);

      // Switch to Manager, verify Manager nav appears and Employee-only nav disappears
      await app.sidebar.selectRole('Manager');
      await expect(page.getByRole('button', { name: 'Team Leave Requests' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'My Leave Requests' })).toHaveCount(0);

      // Switch back to Employee
      await app.sidebar.selectRole('Employee');
      await expect(page.getByRole('button', { name: 'My Leave Requests' })).toBeVisible();
    }
  );
});
