import type { Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

export class DropdownComponent extends BaseComponent {
  async selectByValue(value: string): Promise<void> {
    await this.root.selectOption(value);
  }

  async selectByLabel(label: string): Promise<void> {
    await this.root.selectOption({ label });
  }

  async value(): Promise<string> {
    return this.root.inputValue();
  }

  option(label: string): Locator {
    return this.root.locator('option', { hasText: label });
  }
}
