import type { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  byRole(role: string, name?: string): Locator {
    return name ? this.page.getByRole(role as any, { name }) : this.page.getByRole(role as any);
  }

  byLabel(text: string): Locator {
    return this.page.getByLabel(text);
  }

  byAriaLabel(label: string): Locator {
    return this.page.locator(`[aria-label="${label}"]`);
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async waitForIdle() {
    // Lightweight readiness hook for UI flows; may be overridden by concrete pages later.
    await this.page.waitForLoadState('domcontentloaded');
  }
}
