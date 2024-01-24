import { z } from 'zod';
import type { Assignment } from './assignment';
import type { Geopoint } from './geopoint';
import { roleEnumSchema } from './role';

export const userSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  middle_name: z.string().nullable(),
  last_name: z.string(),
  email: z.string(),
  is_active: z.boolean(),
  role: roleEnumSchema,
  geopoint_id: z.string(),
  phone_number: z.string(),
});
export type User = z.infer<typeof userSchema>;

export type CompleteUser = Omit<User, 'geopoint_id'> & {
  geopoint: Geopoint
  assignments?: Record<string, Assignment>
};
