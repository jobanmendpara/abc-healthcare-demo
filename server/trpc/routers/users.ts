import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import type { Tables } from '~/types';
import { roleEnumSchema, userSchema } from '~/types';

export const usersRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      users: z.array(userSchema),
    }))
    .output(z.void())
    .mutation(async ({ ctx: { db }, input: { users } }) => {
      const { data, error } = await db.from('users').insert(users).select();

      if (error)
        throw new Error(error.message);
      if (!data)
        throw new Error('No data returned.');
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

      const response = role === 'admin' ? { users, invites } : { users };

      return response;
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
