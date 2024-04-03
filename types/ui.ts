export interface NavItem {
  label: string;
  name: string;
  params?: unknown;
  visible: boolean;
  icon?: string;
}

export enum Views {
  EMPLOYEES = 'Employees',
  ADMINS = 'Admins',
  CLIENTS = 'Clients',
  INVITES = 'Invites',
}
