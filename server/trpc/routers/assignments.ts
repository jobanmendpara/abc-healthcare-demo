import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import type { Assignment } from '~/types';
import { assignmentSchema } from '~/types';

export const assignmentsRouter = createTRPCRouter({
  fetch: publicProcedure
    .input(z.object({
      userIds: z.array(z.string().uuid()),
    }))
    .output(z.object({
      assignments: z.record(z.string(), assignmentSchema),
    }))
    .query(async ({ ctx: { db }, input: { userIds } }) => {
      const selectEmployeeAssignmentsQueryResult = await db.from('assignments').select().in('employee_id', userIds);
      if (selectEmployeeAssignmentsQueryResult.error)
        throw new Error(selectEmployeeAssignmentsQueryResult.error.message);

      const selectClientAssignmentsQueryResult = await db.from('assignments').select().in('client_id', userIds);
      if (selectClientAssignmentsQueryResult.error)
        throw new Error(selectClientAssignmentsQueryResult.error.message);

      const assignments = [
        ...selectEmployeeAssignmentsQueryResult.data,
        ...selectClientAssignmentsQueryResult.data,
      ].reduce((acc: Record<string, Assignment>, assignment) => {
        acc[assignment.id] = assignment;
        return acc;
      }, {});
      return {
        assignments,
      };
    }),
});
