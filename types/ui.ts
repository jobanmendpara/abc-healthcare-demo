import type { RoutesNamesList } from '@typed-router';

export interface NavItem {
  label: string;
  name: RoutesNamesList;
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
