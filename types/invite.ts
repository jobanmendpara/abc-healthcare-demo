import { z } from 'zod';
import { roleEnumSchema } from './role';

const inviteSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: roleEnumSchema,
});
export type Invite = z.infer<typeof inviteSchema>;
