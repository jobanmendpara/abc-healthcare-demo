import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const deleteUser = authorizedProcedure
  .input(
    z.object({
      userIds: z.array(z.string().uuid()),
    }),
  ).output(
    z.void(),
  )
  .mutation(async ({
    ctx,
    input,
  }) => {
    const { db, requestor } = ctx;

    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    let assignmentsId: string[] = [];

    const deleteUserSettingsQuery = await db.from('user_settings').delete().in('id', input.userIds).select();
    if (deleteUserSettingsQuery.error)
      throw new Error(deleteUserSettingsQuery.error.message);

    const deleteUsersQuery = await db.from('users').delete().in('id', input.userIds).select();
    if (deleteUsersQuery.error)
      throw new Error(deleteUsersQuery.error.message);

    input.userIds.forEach(async (userId) => {
      const deleteAssignmentsQuery = await db.from('assignments').delete().eq('employee_id', userId).select();
      if (deleteAssignmentsQuery.error)
        throw new Error(deleteAssignmentsQuery.error.message);

      assignmentsId = deleteAssignmentsQuery.data.map(({ id }) => id);

      const deleteAuthQuery = await db.auth.admin.deleteUser(userId);
      if (deleteAuthQuery.error)
        throw new Error(deleteAuthQuery.error.message);
    });

    assignmentsId.forEach(async (assignmentId) => {
      const deleteTimecardsQuery = await db.from('timecards').delete().eq('assignment_id', assignmentId).select();
      if (deleteTimecardsQuery.error)
        throw new Error(deleteTimecardsQuery.error.message);
    });
  });
