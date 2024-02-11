import { z } from 'zod';

export const assignmentsTableSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  employee_id: z.string().uuid(),
});

export const assignmentUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});
export type AssignmentUser = z.infer<typeof assignmentUserSchema>;

export const assignmentSchema = z.object({
  id: z.string().uuid(),
  client: assignmentUserSchema,
  employee: assignmentUserSchema,
});
export type Assignment = z.infer<typeof assignmentSchema>;

export const assignmentChangesSchema = z.object({
  id: z.string().uuid(),
  added: z.array(z.string().uuid()),
  removed: z.array(z.string().uuid()),
});
export interface AssignmentChanges extends z.infer<typeof assignmentChangesSchema> {}
