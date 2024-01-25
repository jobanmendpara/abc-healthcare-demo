import { z } from 'zod';

export const assignmentSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  employee_id: z.string().uuid(),
});
export type Assignment = z.infer<typeof assignmentSchema>;

export const createAssignmentsFormDataSchema = z.object({
  userId: z.string().uuid(),
  usersToAssign: z.array(z.string().uuid()),
});
export type CreateAssignmentsFormData = z.infer<typeof createAssignmentsFormDataSchema>;

export const deleteAssignmentsFormDataSchema = z.object({
  userId: z.string().uuid(),
  usersToUnassign: z.array(z.string().uuid()),
});
export type DeleteAssignmentsFormData = z.infer<typeof deleteAssignmentsFormDataSchema>;
