import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component';

export class SidebarComponent extends BaseComponent {
  private readonly roleSelect: Locator;

  constructor(root: Locator) {
    super(root);
    this.roleSelect = root.locator('#role-switcher');
  }

  async selectRole(role: 'Employee' | 'Manager') {
    await this.roleSelect.selectOption({ label: role });
  }
}
