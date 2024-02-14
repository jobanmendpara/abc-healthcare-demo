import { z } from 'zod';
import { geopointSchema, phoneSchema, roleEnumSchema } from '~/types';

export const usersTableSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1).max(255),
  middle_name: z.string().nullable(),
  last_name: z.string().min(1).max(255),
  email: z.string(),
  is_active: z.boolean(),
  role: roleEnumSchema,
  phone_number: phoneSchema,
  geopoint_id: z.string(),
});

export const userSchema = z.object({
  ...usersTableSchema.shape,
  geopoint: geopointSchema,
});
export interface User extends z.infer<typeof userSchema> { }
