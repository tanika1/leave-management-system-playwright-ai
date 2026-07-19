import type { Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

// Represents the "Leave Balance" card and table
export class BalanceCardComponent extends BaseComponent {
  private table: Locator;

  constructor(root: Locator) {
    super(root);
    this.table = root.getByRole('table', { name: 'Leave balance by type' });
  }

  rowByType(type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid'): Locator {
    return this.table.getByRole('row').filter({ hasText: type }).first();
  }

  async getBaseline(type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid'): Promise<string> {
    const row = this.rowByType(type);
    return row.getByRole('cell').nth(1).innerText();
  }

  async getUsed(type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid'): Promise<string> {
    const row = this.rowByType(type);
    return row.getByRole('cell').nth(2).innerText();
  }

  async getRemaining(type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid'): Promise<string> {
    const row = this.rowByType(type);
    return row.getByRole('cell').nth(3).innerText();
  }
}
