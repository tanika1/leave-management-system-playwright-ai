import type { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

export class EmployeeSelectorComponent extends BaseComponent {
  private readonly selector: Locator;

  constructor(page: Page) {
    super(page.locator('#employee-selector'));
    this.selector = this.root;
  }

  async isVisible(): Promise<boolean> {
    return await this.selector.isVisible();
  }

  async selectById(id: number) {
    await this.selector.selectOption(String(id));
  }

  async selectByLabel(label: string) {
    await this.selector.selectOption({ label });
  }
}
