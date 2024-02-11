import { z } from 'zod';
import { roleEnumSchema } from './role';

export const invitesTableSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: roleEnumSchema,
});
export interface Invite extends z.infer<typeof invitesTableSchema> { }
