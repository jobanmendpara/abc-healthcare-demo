import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
import { getCompleteUsers } from '~/server/db/helpers';
import { calculatePageRange, initUserSettings } from '~/utils';
import type { User } from '~/types';
import { roleEnumSchema, userSchema } from '~/types';

export const usersRouter = createTRPCRouter({
  create: authorizedProcedure
    .input(
      z.object({
        user: userSchema,
      }),
    ).output(
      z.void(),
    ).mutation(async ({
      ctx: { db, requestor },
      input: { user },
    }) => {
      if (requestor.role !== 'admin')
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });
      const newUser: Omit<User, 'geopoint' | 'assignments'> = user;
      const geopoint = user.geopoint;
      const insertUserQuery = await db.from('users').insert(newUser).select();
      if (insertUserQuery.error)
        throw new Error(insertUserQuery.error.message);

      const insertGeopointQuery = await db.from('geopoints').insert(geopoint).select();
      if (insertGeopointQuery.error)
        throw new Error(insertGeopointQuery.error.message);

      const initialUserSettings = initUserSettings(user.id);
      const insertUserSettingsQuery = await db.from('user_settings').insert(initialUserSettings).select();
      if (insertUserSettingsQuery.error)
        throw new Error(insertUserSettingsQuery.error.message);
    },
    ),
  delete: authorizedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().uuid()),
      }),
    ).output(
      z.void(),
    )
    .mutation(async ({
      ctx: { db, requestor },
      input,
    }) => {
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
    },
    ),
  list: authorizedProcedure
    .input(
      z.object({
        role: roleEnumSchema,
        page: z.number().int().positive(),
        size: z.number().int().positive(),
      }),
    ).output(z.object({
      list: z.array(userSchema),
      hasNextPage: z.boolean(),
    }))
    .query(async ({
      ctx: { db, requestor },
      input: { role, page, size },
    }) => {
      if (requestor.role !== 'admin')
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      const { start, end } = calculatePageRange(page, size);

      const { data: users, error: usersError } = await db.from('users').select().order('last_name', { ascending: true }).eq('role', role).range(start, end);
      if (usersError)
        throw new Error(usersError.message);
      if (!users)
        throw new Error('No users returned.');

      const { data: nextPage, error: nextPageError } = await db.from('users').select().eq('role', role).range(end, end + 1);
      if (nextPageError)
        throw new Error(nextPageError.message);

      const list = await getCompleteUsers(db, users);

      return {
        list,
        hasNextPage: nextPage.length > 0,
      };
    }),
  getById: authorizedProcedure
    .input(
      z.object({
        userIds: z.array(z.string().uuid()),
      }),
    ).output(
      z.object({
        data: z.map(z.string().uuid(), userSchema),
      }),
    ).query(async ({
      ctx: { db, requestor },
      input: { userIds },
    }) => {
      if (requestor.role !== 'admin')
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      const { data: users, error } = await db.from('users').select().in('id', userIds);
      if (error)
        throw new Error(error.message);

      const completeUsers = await getCompleteUsers(db, users);

      const data = completeUsers.reduce((acc: Map<string, User>, user) => {
        acc.set(user.id, user);
        return acc;
      }, new Map<string, User>());

      return {
        data,
      };
    }),
});
