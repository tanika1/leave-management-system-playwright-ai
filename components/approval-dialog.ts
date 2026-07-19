import type { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

// Current app uses inline actions; this component wraps approval actions ergonomically.
export class ApprovalDialogComponent extends BaseComponent {
  constructor(page: Page) {
    super(page.locator('.action-buttons'));
  }

  approveButtonForRequest(id: number): Locator {
    return this.root.page().getByRole('button', { name: `Approve request ${id}` });
  }

  async approve(id: number): Promise<void> {
    await this.approveButtonForRequest(id).click();
  }
}
