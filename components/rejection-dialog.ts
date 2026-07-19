import type { Page, Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

// Current app uses inline rejection controls; this component abstracts that pattern.
export class RejectionDialogComponent extends BaseComponent {
  constructor(page: Page) {
    super(page.locator('.reject-inline'));
  }

  rejectButtonForRequest(id: number): Locator {
    return this.root.page().getByRole('button', { name: `Reject request ${id}` });
  }

  reasonInputForRequest(id: number): Locator {
    return this.root.page().getByLabel(`Rejection reason for request ${id}`);
  }

  confirmButtonForRequest(id: number): Locator {
    return this.root.page().getByRole('button', { name: `Confirm rejection of request ${id}` });
  }

  cancelButton(): Locator {
    return this.root.page().getByRole('button', { name: 'Cancel rejection' });
  }

  async startReject(id: number): Promise<void> {
    await this.rejectButtonForRequest(id).click();
  }

  async confirmReject(id: number, reason: string): Promise<void> {
    await this.reasonInputForRequest(id).fill(reason);
    await this.confirmButtonForRequest(id).click();
  }

  async cancelReject(): Promise<void> {
    await this.cancelButton().click();
  }
}
