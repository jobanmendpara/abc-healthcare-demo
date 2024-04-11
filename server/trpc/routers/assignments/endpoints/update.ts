import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { assignmentChangesSchema } from '~/types';

export const update = authorizedProcedure
  .input(
    assignmentChangesSchema,
  )
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx: { db, requestor },
    input,
  }) => {
    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const requestedUserRoleQuery = await db.from('users').select('role').eq('id', input.id).single();
    if (requestedUserRoleQuery.error && !requestedUserRoleQuery.data)
      throw new TRPCError({ code: 'NOT_FOUND' });

    const oppositeField = requestedUserRoleQuery.data.role === 'employee' ? 'client' : 'employee';

    const deleteAssignments = await db.from('assignments')
      .delete()
      .eq(`${requestedUserRoleQuery.data.role}_id`, input.id)
      .in(`${oppositeField}_id`, input.removed.map(id => id));
    if (deleteAssignments.error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: deleteAssignments.error });

    const insertAssignments = await db.from('assignments')
      .insert(input.added.map(id => ({
        id: crypto.randomUUID(),
        client_id: oppositeField === 'client' ? id : input.id,
        employee_id: oppositeField === 'employee' ? id : input.id,
      })));
    if (insertAssignments.error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: insertAssignments.error });
  });
