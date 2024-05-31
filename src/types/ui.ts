import type { RoutesNamesList } from '@typed-router';
import type { LocationQueryRaw } from '#vue-router';

export interface NavItem {
  label: string;
  name: RoutesNamesList;
  query?: LocationQueryRaw;
  params?: unknown;
  visible: boolean;
  icon?: string;
}

export enum TimecardsPageViews {
  APPROVED = 'Approved',
  PENDING = 'Pending',
}

export enum UsersPageViews {
  EMPLOYEES = 'Employees',
  ADMINS = 'Admins',
  CLIENTS = 'Clients',
  INVITES = 'Invites',
}
