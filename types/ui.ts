import type { AppRoutes } from './general';

export interface NavItem {
  label: string
  route: AppRoutes
  visible: boolean
  icon?: string
}
