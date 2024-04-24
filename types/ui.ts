import type { RoutesNamesList } from '@typed-router';
import type { LocationQueryRaw } from '#vue-router';

export interface NavItem {
  label: string;
  name: RoutesNamesList;
  query?: LocationQueryRaw;
  visible: boolean;
  icon?: string;
}

export enum Views {
  EMPLOYEES = 'Employees',
  ADMINS = 'Admins',
  CLIENTS = 'Clients',
  INVITES = 'Invites',
}
