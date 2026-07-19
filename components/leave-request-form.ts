import type { Locator } from '@playwright/test';
import { BaseComponent } from './base-component';

export class LeaveRequestFormComponent extends BaseComponent {
  private leaveTypeSelect: Locator;
  private startDateInput: Locator;
  private endDateInput: Locator;
  private submitButton: Locator;

  constructor(root: Locator) {
    super(root);
    this.leaveTypeSelect = root.locator('#leave-type');
    this.startDateInput = root.locator('#start-date');
    this.endDateInput = root.locator('#end-date');
    this.submitButton = root.getByRole('button', { name: 'Submit Request' });
  }

  async chooseLeaveType(type: 'Annual' | 'Sick' | 'Casual' | 'Unpaid') {
    await this.leaveTypeSelect.selectOption(type);
  }

  async setStartDate(value: string) {
    await this.startDateInput.fill('');
    await this.startDateInput.fill(value);
  }

  async setEndDate(value: string) {
    await this.endDateInput.fill('');
    await this.endDateInput.fill(value);
  }

  async submit() {
    await this.submitButton.click();
  }
}
