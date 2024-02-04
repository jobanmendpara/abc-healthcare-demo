import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

export enum AppLoginMethods {
  EMAIL = 'email',
  PHONE = 'phone',
  GOOGLE = 'google',
}

export type AppDatabaseClient = SupabaseClient<Database, 'public', Database['public']>;
