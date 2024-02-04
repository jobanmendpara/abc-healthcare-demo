import { z } from 'zod';
import { roleEnumSchema } from './role';

export const invitesTableSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: roleEnumSchema,
});
export interface Invite extends z.infer<typeof invitesTableSchema> { }

export const inviteRequest = z.object({
  ...invitesTableSchema.shape,
  redirectTo: z.string().url(),
});
export interface InviteRequest extends z.infer<typeof inviteRequest> { }
