import type { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES } from '../constants/routes';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(baseUrl: string): Promise<void> {
    await this.goto(`${baseUrl}${ROUTES.HOME}`);
    await this.waitForIdle();
  }
}
