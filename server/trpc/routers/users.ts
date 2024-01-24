import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { initUserSettings } from '~/utils/initializers';
import type { Tables } from '~/types';
import { roleEnumSchema, userSchema } from '~/types';
import { getUnknownErrorMessage } from '~/utils/errorHandling';

export const usersRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      users: z.array(userSchema),
    }))
    .output(z.void())
    .mutation(async ({ ctx: { db }, input: { users } }) => {
      const insertUserQuery = await db.from('users').insert(users).select();
      if (insertUserQuery.error)
        throw new Error(insertUserQuery.error.message);
      if (!insertUserQuery.data)
        throw new Error('No data returned.');

      const initialUserSettings = users.map(({ id }) => initUserSettings(id));
      const insertUserSettingsQuery = await db.from('user_settings').insert(initialUserSettings).select();
      if (insertUserSettingsQuery.error)
        throw new Error(insertUserSettingsQuery.error.message);
      if (!insertUserSettingsQuery.data)
        throw new Error('No data returned.');
    }),
  delete: publicProcedure
    .input(z.object({
      userIds: z.array(z.string().uuid()),
    }))
    .output(z.void())
    .mutation(async ({ ctx: { db }, input }) => {
      const errors: string[] = [];

      let assignmentsId: number[] = [];
      const deleteUsersQuery = await db.from('users').delete().in('id', input.userIds).select();
      if (deleteUsersQuery.error)
        errors.push(getUnknownErrorMessage(deleteUsersQuery.error));

      const deleteUserSettingsQuery = await db.from('user_settings').delete().in('id', input.userIds).select();
      if (deleteUserSettingsQuery.error)
        errors.push(getUnknownErrorMessage(deleteUserSettingsQuery.error));

      input.userIds.forEach(async (userId) => {
        const deleteAssignmentsQuery = await db.from('assignments').delete().eq('employee_id', userId).select();
        if (deleteAssignmentsQuery.error) {
          errors.push(getUnknownErrorMessage(deleteAssignmentsQuery.error.message));
          return;
        }

        assignmentsId = deleteAssignmentsQuery.data.map(({ id }) => id);

        const deleteAuthQuery = await db.auth.admin.deleteUser(userId);
        if (deleteAuthQuery.error)
          errors.push(getUnknownErrorMessage(deleteAuthQuery.error.message));
      });

      assignmentsId.forEach(async (assignmentId) => {
        const deleteTimecardsQuery = await db.from('timecards').delete().eq('assignment_id', assignmentId).select();
        if (deleteTimecardsQuery.error)
          errors.push(getUnknownErrorMessage(deleteTimecardsQuery.error.message));
      });

      if (errors.length > 0)
        throw errors;
    }),
  fetch: publicProcedure
    .input(z.object({
      userId: z.string().uuid(),
    }))
    .output(z.object({
      users: z.record(z.string().uuid(), userSchema),
      invites: z.record(z.string().uuid(), z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        role: roleEnumSchema,
      })).optional(),
    }))
    .query(async ({ ctx: { db }, input: { userId } }) => {
      let invites: Record<string, Tables<'invites'>> = {};
      let users: Record<string, Tables<'users'>> = {};
      const getRequestor = await db.from('users').select().eq('id', userId).single();

      if (getRequestor.error)
        throw new Error(getRequestor.error.message);
      if (!getRequestor.data)
        throw new Error('No data returned.');

      const { role } = getRequestor.data;

      if (role === 'admin') {
        const getAllUsers = await db.from('users').select();
        if (getAllUsers.error)
          throw new Error(getAllUsers.error.message);
        if (!getAllUsers.data)
          throw new Error('No data returned.');

        const getAllInvites = await db.from('invites').select();
        if (getAllInvites.error)
          throw new Error(getAllInvites.error.message);
        if (!getAllInvites.data)
          throw new Error('No data returned.');

        invites = getAllInvites.data.reduce((acc: Record<string, Tables<'invites'>>, invite) => {
          acc[invite.id] = invite;

          return acc;
        }, {});

        users = getAllUsers.data.reduce((acc: Record<string, Tables<'users'>>, user) => {
          acc[user.id] = user;

          return acc;
        }, {});
      }
      else {
        const getAssignedUsersIds = await db.from('assignments').select(`employee_id`).eq('employee_id', userId);
        if (getAssignedUsersIds.error)
          throw new Error(getAssignedUsersIds.error.message);
        if (!getAssignedUsersIds.data)
          throw new Error('No data returned.');

        const userIdsList = getAssignedUsersIds.data.map(({ employee_id }) => employee_id);
        const getAssignedUsers = await db.from('users').select().in('id', userIdsList);
        if (getAssignedUsers.error)
          throw new Error(getAssignedUsers.error.message);
        if (!getAssignedUsers.data)
          throw new Error('No data returned.');

        getAssignedUsers.data.push(getRequestor.data);

        users = getAssignedUsers.data.reduce((acc: Record<string, Tables<'users'>>, user) => {
          acc[user.id] = user;

          return acc;
        }, {});
      }

      delete users[userId];

      return role === 'admin' ? { users, invites } : { users };
    }),
  get: publicProcedure
    .input(z.object({
      userIds: z.array(z.string().uuid()),
    }))
    .output(z.object({
      users: z.array(userSchema),
    }))
    .query(async ({ ctx: { db }, input: { userIds } }) => {
      const { data, error } = await db.from('users').select().in('id', userIds);
      if (error)
        throw new Error(error.message);
      if (!data)
        throw new Error('No data returned.');

      return {
        users: data,
      };
    }),
});
