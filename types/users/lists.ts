import type { ListParams, Role } from '~/types';

export interface UsersListParams extends ListParams {
  role: Role
}
