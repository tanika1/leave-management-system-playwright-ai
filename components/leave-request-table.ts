import type { Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

export class LeaveRequestTableComponent extends BaseComponent {
  rows(): Locator {
    return this.root.getByRole('row');
  }

  rowByRequestId(id: number): Locator {
    return this.root.locator(`tbody tr:has(td:first-child:text-is("${id}"))`).first();
  }

  statusPill(id: number): Locator {
    return this.rowByRequestId(id).locator('.status');
  }

  reasonCell(id: number): Locator {
    return this.rowByRequestId(id).locator('td.reason-cell');
  }

  actionButton(id: number, name: string): Locator {
    return this.rowByRequestId(id).getByRole('button', { name });
  }
}
