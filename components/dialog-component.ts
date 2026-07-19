import type { Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

export class DialogComponent extends BaseComponent {
  title(): Locator {
    return this.root.getByRole('heading');
  }

  actionButton(name: string): Locator {
    return this.root.getByRole('button', { name });
  }

  async closeByButton(name: string): Promise<void> {
    await this.actionButton(name).click();
  }
}
