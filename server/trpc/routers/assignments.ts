import { z } from 'zod';
import { useDateFormat } from '@vueuse/core';
import { createTRPCRouter, publicProcedure } from '../trpc';
import type { Assignment, Enums } from '~/types';
import { assignmentSchema, createAssignmentsFormDataSchema, deleteAssignmentsFormDataSchema } from '~/types';

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
  create: publicProcedure
    .input(z.object({
      items: z.array(createAssignmentsFormDataSchema),
    }))
    .output(z.void())
    .mutation(async ({ ctx: { db }, input }) => {
      const sourceIds = input.items.map(item => item.userId);
      const selectUsersQueryResults = await db.from('users').select(`id, role`).in('id', sourceIds);
      if (selectUsersQueryResults.error)
        throw new Error(selectUsersQueryResults.error.message);

      const usersRoleMap = selectUsersQueryResults.data.reduce((acc: Map<string, Enums<'role_enum'>>, user) => {
        acc.set(user.id, user.role);

        return acc;
      }, new Map());

      const assignmentsToInsert = input.items.map((item) => {
        const assignments = item.usersToAssign.map(userToAssign => ({
          id: crypto.randomUUID(),
          employee_id: usersRoleMap.get(item.userId) === 'employee' ? item.userId : userToAssign,
          client_id: usersRoleMap.get(item.userId) === 'client' ? item.userId : userToAssign,
        }));

        return assignments;
      }).flat();

      const insertAssignmentsQueryResults = await db.from('assignments').insert(assignmentsToInsert).select();
      if (insertAssignmentsQueryResults.error)
        throw new Error(insertAssignmentsQueryResults.error.message);
    }),
  delete: publicProcedure
    .input(z.object({
      items: z.array(deleteAssignmentsFormDataSchema),
    }))
    .output(z.void())
    .mutation(async ({ ctx: { db }, input }) => {
      const sourceIds = input.items.map(item => item.userId);
      const selectUsersQueryResults = await db.from('users').select(`id, role`).in('id', sourceIds);
      if (selectUsersQueryResults.error)
        throw new Error(selectUsersQueryResults.error.message);

      const usersRoleMap = selectUsersQueryResults.data.reduce((acc: Map<string, Enums<'role_enum'>>, user) => {
        acc.set(user.id, user.role);

        return acc;
      }, new Map());

      const usersUnassignmentMap = input.items.reduce((acc: Map<string, string[]>, item) => {
        acc.set(item.userId, item.usersToUnassign);

        return acc;
      }, new Map());

      sourceIds.forEach(async (sourceId) => {
        const field = usersRoleMap.get(sourceId) === 'employee' ? 'client_id' : 'employee_id';
        const ids = usersUnassignmentMap.get(sourceId) ?? [];
        const deleteAssignmentsQueryResults = await db.from('assignments').delete().in(field, ids).select();
        if (deleteAssignmentsQueryResults.error)
          throw new Error(deleteAssignmentsQueryResults.error.message);
      });
    }),
});
