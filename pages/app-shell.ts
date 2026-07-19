import type { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { SidebarComponent } from '../components/sidebar-component';
import { NavigationComponent } from '../components/navigation-component';
import { EmployeeSelectorComponent } from '../components/employee-selector';

export class AppShellPage extends BasePage {
  readonly sidebar: SidebarComponent;
  readonly navigation: NavigationComponent;
  readonly employeeSelector: EmployeeSelectorComponent;

  constructor(page: Page) {
    super(page);
    this.sidebar = new SidebarComponent(this.page.locator('aside[aria-label="Primary navigation sidebar"]'));
    this.navigation = new NavigationComponent(this.page.getByRole('navigation', { name: 'Primary navigation' }));
    this.employeeSelector = new EmployeeSelectorComponent(this.page);
  }

  async open(url: string) {
    await this.goto(url);
    await this.waitForIdle();
  }
}
