import { z } from 'zod';

export const assignmentSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  client_id: z.string().uuid(),
  employee_id: z.string().uuid(),
});
export type Assignment = z.infer<typeof assignmentSchema>;
