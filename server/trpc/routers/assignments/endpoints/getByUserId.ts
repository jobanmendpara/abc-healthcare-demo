import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';
import type { AssignmentUser, Enums } from '~/types';

export const getByUserId = authorizedProcedure.input(
  z.object({
    userId: z.string().uuid(),
  }),
).query(
  async ({
    ctx,
    input,
  }) => {
    const { userId } = input;
    const { db } = ctx;

    const allowedRoles: Enums<'role_enum'>[] = ['admin', 'employee'];

    if (!allowedRoles.includes(ctx.requestor.role))
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const requestedUserRole = await db.from('users').select('role').eq('id', userId).single();
    if (requestedUserRole.error && !requestedUserRole.data)
      throw new TRPCError({ code: 'NOT_FOUND' });

    const sourceRole: Enums<'role_enum'> = `${requestedUserRole.data.role}`;
    const destinationRole = sourceRole === 'employee' ? 'client' : 'employee';

    if (sourceRole !== 'employee' && sourceRole !== 'client') {
      return {
        assigned: [],
        assignable: [],
      };
    }

    const { data: existingAssignments, error: existingAssignmentsError } = await db
      .from('assignments')
      .select()
      .eq(`${sourceRole}_id`, userId);
    if (existingAssignmentsError && !existingAssignments)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: existingAssignmentsError });

    const assignedUserIds = existingAssignments.map(assignment => assignment[`${destinationRole}_id`]);

    const { data: assignedUsers, error: assignedUsersError } = await db
      .from('users')
      .select('id, first_name, last_name')
      .in('id', assignedUserIds);
    if (assignedUsersError && !assignedUsers)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: assignedUsersError });

    const assignedUsersMap = assignedUsers.reduce((acc: Map<string, AssignmentUser>, user) => {
      const newAssignmentUser: AssignmentUser = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
      };
      acc.set(user.id, newAssignmentUser);

      return acc;
    }, new Map<string, AssignmentUser>());

    const sourceUserName = await db.from('users').select('first_name, last_name').eq('id', userId).single();
    if (sourceUserName.error && !sourceUserName.data)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: sourceUserName.error });

    const assigned = existingAssignments.map((assignment) => {
      const destinationUser = assignedUsersMap.get(assignment[`${destinationRole}_id`]);
      if (!destinationUser)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const newAssignment = {
        id: assignment.id,
        [destinationRole]: destinationUser,
        [sourceRole]: {
          id: input.userId,
          name: `${sourceUserName.data.first_name} ${sourceUserName.data.last_name}`,
        },
      };

      return newAssignment;
    });

    const { data: assignableUsers, error: assignableUsersError } = await db
      .from('users')
      .select('id, first_name, last_name')
      .eq('role', destinationRole)
      .not('id', 'in', `(${assignedUserIds.join(',')})`);
    if (assignableUsersError && !assignableUsers)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: assignableUsersError });

    const assignable: AssignmentUser[] = assignableUsers.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
    }));

    return {
      assigned,
      assignable,
    };
  },
);