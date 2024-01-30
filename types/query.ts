import type { CompleteUser } from './user';
import type { UserSettings } from './userSettings';

export type UserQueryData = CompleteUser & {
  settings: Omit<UserSettings, 'id'>
};
