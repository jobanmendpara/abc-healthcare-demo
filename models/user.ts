import { z } from 'zod';

import { LocationSchema } from '~/models/location';

export const UserRolesEnum = z.enum(['admin', 'employee', 'client']);
export type UserRoles = z.infer<typeof UserRolesEnum>;

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: UserRolesEnum,
  phoneNumber: z.string(),
  address: LocationSchema,
  // WARN: TESTING
  assignments: z.array(z.string()).optional(),
});
export type User = z.infer<typeof UserSchema>;
