import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
import type { AssignmentUser, Tables } from '~/types';
import { assignmentSchema, assignmentUserSchema } from '~/types';

export const assignmentsRouter = createTRPCRouter({
  getByUserId: authorizedProcedure.input(
    z.object({
      userId: z.string().uuid(),
    }),
  ).output(
    z.object({
      assigned: z.array(assignmentSchema),
      assignable: z.array(assignmentUserSchema),
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

      const fieldToSearch: keyof Omit<Tables<'assignments'>, 'id'> = getUserRole.data.role === 'employee'
        ? 'employee_id'
        : 'client_id';

      const { data: existingAssignments, error: existingAssignmentsError } = await db
        .from('assignments')
        .select()
        .eq(fieldToSearch, userId);
      if (existingAssignmentsError && !existingAssignments)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: existingAssignmentsError });

      const assignedUserIds = existingAssignments.map(assignment => assignment[fieldToSearch]);

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

      const assigned = existingAssignments.map((assignment) => {
        const user = assignedUsersMap.get(assignment[fieldToSearch]);
        if (!user)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const initAssignmentUser = {
          id: '',
          name: '',
        };

        const newAssignment = {
          id: assignment.id,
          client: fieldToSearch === 'client_id' ? user : initAssignmentUser,
          employee: fieldToSearch === 'employee_id' ? user : initAssignmentUser,
        };

        return newAssignment;
      });

      const { data: assignableUsers, error: assignableUsersError } = await db
        .from('users')
        .select('id, first_name, last_name')
        .eq('role', getUserRole.data.role === 'employee' ? 'client' : 'employee')
        .not('id', 'in', `(${assignedUserIds.join(', ')})`);
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
});
