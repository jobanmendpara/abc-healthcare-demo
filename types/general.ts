import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from './supabase';

export enum AppLoginMethods {
  EMAIL = 'email',
  PHONE = 'phone',
  GOOGLE = 'google',
}

export type AppDatabaseClient = SupabaseClient<Database, 'public', Database['public']>;

export const phoneSchema = z.string().length(10).regex(/^\d{10}$/);
