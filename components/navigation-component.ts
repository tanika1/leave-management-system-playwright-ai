import type { Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

export class NavigationComponent extends BaseComponent {
  navList(): Locator {
    return this.root.locator('ul.nav-list');
  }

  navButton(label: string): Locator {
    return this.root.getByRole('button', { name: label });
  }

  async goTo(label: string) {
    await this.navButton(label).click();
  }
}
