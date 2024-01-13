import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

export enum AppRoutes {
  '/' = '/',
  CONFIRM = '/confirm',
  HOME = '/home',
  NOT_FOUND = '/404',
  PEOPLE = '/people',
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',
  VERIFY = '/verify',
}

export enum AppSignInMethods {
  EMAIL = 'email',
  PHONE = 'phone',
  GOOGLE = 'google',
}

export type AppDatabaseClient = SupabaseClient<Database, 'public', Database['public']>;
