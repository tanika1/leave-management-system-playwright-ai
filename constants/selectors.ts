export const SELECTORS = {
  SIDEBAR: 'aside[aria-label="Primary navigation sidebar"]',
  NAVIGATION: 'nav[aria-label="Primary navigation"]',
  ROLE_SWITCHER: '#role-switcher',
  EMPLOYEE_SELECTOR: '#employee-selector',
  LEAVE_FORM: 'form[aria-label="Leave request form"]',
  MY_REQUESTS_TABLE: 'table[aria-label="My leave requests table"]',
  TEAM_REQUESTS_TABLE: 'table[aria-label="Team leave requests table"]',
  BALANCE_TABLE: 'table[aria-label="Leave balance by type"]'
} as const;
