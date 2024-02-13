import type { PageParams } from '@supabase/supabase-js';
import type { Role } from '~/types';

export interface UsersListParams extends PageParams {
  role: Role
}
