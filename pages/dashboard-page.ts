import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  viewHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  feedback(): Locator {
    return this.page.getByRole('status');
  }

  async currentSectionText(): Promise<string> {
    const meta = this.page.locator('.meta').first();
    return meta.innerText();
  }
}
