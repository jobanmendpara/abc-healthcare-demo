import type { User, UserSettings } from '~/types';

export type UserQueryData = User & {
  settings: Omit<UserSettings, 'id'>
};
