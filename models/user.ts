import { z } from 'zod';

import { LocationSchema } from '~/models/location';

const UserRolesValues = ['DEV', 'ADMIN', 'EMPLOYEE', 'CLIENT'] as const;

export const UserRolesEnum = z.enum(UserRolesValues);

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: UserRolesEnum,
  phoneNumber: z.string(),
  address: LocationSchema,
  assignments: z.array(z.string()),
});
export type User = z.infer<typeof UserSchema>;
