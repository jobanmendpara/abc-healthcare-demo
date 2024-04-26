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

export enum AppDateFormats {
  DATE = 'MM-DD-YY',
  PERIOD = 'A',
  SEPARATOR = ' / ',
  TIME = 'hh:mm:ss',
  SERVER = 'YYYY-MM-DD HH:mm:ss',
}
