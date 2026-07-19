import type { Page } from '@playwright/test';
import { DashboardPage } from './dashboard-page';
import { LeaveRequestTableComponent } from '../components/leave-request-table';
import { ApprovalDialogComponent } from '../components/approval-dialog';
import { RejectionDialogComponent } from '../components/rejection-dialog';

export class ManagerDashboardPage extends DashboardPage {
  readonly requestsTable: LeaveRequestTableComponent;
  readonly approvalDialog: ApprovalDialogComponent;
  readonly rejectionDialog: RejectionDialogComponent;

  constructor(page: Page) {
    super(page);
    this.requestsTable = new LeaveRequestTableComponent(page.getByRole('table', { name: 'Team leave requests table' }));
    this.approvalDialog = new ApprovalDialogComponent(page);
    this.rejectionDialog = new RejectionDialogComponent(page);
  }
}
