import { z } from 'zod';
import { roleEnumSchema } from './role';

export const inviteFormDataSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: roleEnumSchema,
});
export type InviteFormData = z.infer<typeof inviteFormDataSchema>;
