import type { Page } from '@playwright/test';
import { DashboardPage } from './dashboard-page';
import { BalanceCardComponent } from '../components/balance-card';
import { LeaveRequestFormComponent } from '../components/leave-request-form';
import { LeaveRequestTableComponent } from '../components/leave-request-table';

export class EmployeeDashboardPage extends DashboardPage {
  readonly balanceCard: BalanceCardComponent;
  readonly requestForm: LeaveRequestFormComponent;
  readonly requestsTable: LeaveRequestTableComponent;

  constructor(page: Page) {
    super(page);
    this.balanceCard = new BalanceCardComponent(page.locator('.balance-card'));
    this.requestForm = new LeaveRequestFormComponent(page.locator('form[aria-label="Leave request form"]'));
    this.requestsTable = new LeaveRequestTableComponent(page.getByRole('table', { name: 'My leave requests table' }));
  }
}
