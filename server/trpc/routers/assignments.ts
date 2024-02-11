import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
import type { AssignmentUser, Enums } from '~/types';
import { assignmentChangesSchema } from '~/types';

export const assignmentsRouter = createTRPCRouter({
  getByUserId: authorizedProcedure.input(
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

      const getUserRole = await db.from('users').select('role').eq('id', userId).single();
      if (getUserRole.error && !getUserRole.data)
        throw new TRPCError({ code: 'NOT_FOUND' });

      const sourceRole: Enums<'role_enum'> = `${getUserRole.data.role}`;
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
          name: `${user.first_name} ${user.last_name}`,
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
        .eq('role', getUserRole.data.role === 'employee' ? 'client' : 'employee')
        .not('id', 'in', `(${assignedUserIds.join(',')})`);
      if (assignableUsersError && !assignableUsers)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: assignableUsersError });

      const assignable: AssignmentUser[] = assignableUsers.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
      }));

      return {
        assigned,
        assignable,
      };
    },
  ),
  update: authorizedProcedure
    .input(
      assignmentChangesSchema,
    )
    .output(
      z.void(),
    )
    .mutation(async ({
      ctx: { db },
      input,
    }) => {
      const getUserRoleQuery = await db.from('users').select('role').eq('id', input.id).single();
      if (getUserRoleQuery.error && !getUserRoleQuery.data)
        throw new TRPCError({ code: 'NOT_FOUND' });

      const oppositeField = getUserRoleQuery.data.role === 'employee' ? 'client' : 'employee';

      const deleteAssignments = await db.from('assignments')
        .delete()
        .eq(`${getUserRoleQuery.data.role}_id`, input.id)
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
    }),
});
