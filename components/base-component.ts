import type { Locator } from '@playwright/test';

export class BaseComponent {
  constructor(protected readonly root: Locator) {}

  get locator(): Locator { return this.root; }
}
