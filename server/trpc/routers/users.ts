import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { appRouter } from '../root';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
import { calculatePageRange, initUserSettings } from '~/utils';
import type { Tables, User } from '~/types';
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

      const newUser: Tables<'users'> = {
        id: user.id,
        role: user.role,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        is_active: true,
        geopoint_id: user.geopoint.id,
      };
      const geopoint = user.geopoint;
      const insertGeopointQuery = await db.from('geopoints').upsert(geopoint, {
        onConflict: 'id',
      }).select();
      if (insertGeopointQuery.error)
        throw new Error(insertGeopointQuery.error.message);

      const insertUserQuery = await db.from('users').insert(newUser).select();
      if (insertUserQuery.error)
        throw new Error(insertUserQuery.error.message);

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
    }),
  list: authorizedProcedure
    .input(
      z.object({
        role: roleEnumSchema,
        page: z.number().int().positive().default(1),
        perPage: z.number().int().positive().default(10),
      }),
    ).output(z.object({
      list: z.array(userSchema),
      hasNextPage: z.boolean(),
    }))
    .query(async ({
      ctx,
      input: { role, page, perPage },
    }) => {
      const { db, requestor } = ctx;
      const caller = appRouter.createCaller(ctx);

      if (requestor.role !== 'admin')
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      const { start, end } = calculatePageRange(page, perPage);

      const { data: users, error: usersError } = await db.from('users')
        .select()
        .order('last_name', { ascending: true })
        .eq('role', role)
        .range(start, end);
      if (usersError)
        throw new Error(usersError.message);
      if (!users)
        throw new Error('No users returned.');

      const { data: nextPage, error: nextPageError } = await db.from('users')
        .select()
        .eq('role', role)
        .range(end, end + 1);
      if (nextPageError)
        throw new Error(nextPageError.message);
      if (!nextPage)
        throw new Error('No next page returned.');

      const data = await caller.users.getById({ userIds: users.map(user => user.id) });

      const list: User[] = Array.from(data.values());

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
      z.map(z.string().uuid(), userSchema),
    ).query(async ({
      ctx: { db },
      input: { userIds },
    }) => {
      const { data: users, error } = await db.from('users').select().in('id', userIds).order('last_name', { ascending: true });
      if (error)
        throw new Error(error.message);

      const geopointIds = users.map(user => user.geopoint_id);
      const { data: geopoints, error: geopointsError } = await db.from('geopoints').select().in('id', geopointIds);
      if (geopointsError)
        throw new Error(geopointsError.message);
      if (!geopoints)
        throw new Error('No geopoints associated with users.');

      const employeeIds = users.reduce((acc: Set<string>, user) => {
        if (user.role === 'employee')
          acc.add(user.id);
        return acc;
      }, new Set<string>());
      const clientIds = users.reduce((acc: Set<string>, user) => {
        if (user.role === 'client')
          acc.add(user.id);
        return acc;
      }, new Set<string>());

      const { data: employeeAssignments, error: employeeAssignmentsError } = await db.from('assignments').select().in('employee_id', Array.from(employeeIds));
      if (employeeAssignmentsError)
        throw new Error(employeeAssignmentsError.message);
      if (!employeeAssignments)
        throw new Error('No assignments associated with employees.');

      const { data: clientAssignments, error: clientAssignmentsError } = await db.from('assignments').select().in('client_id', Array.from(clientIds));
      if (clientAssignmentsError)
        throw new Error(clientAssignmentsError.message);
      if (!clientAssignments)
        throw new Error('No assignments associated with clients.');

      const completeUsers = users.reduce((acc: Set<User>, user) => {
        const geopoint = geopoints.find(geopoint => geopoint.id === user.geopoint_id) ?? initGeopoint();

        acc.add({
          ...user,
          geopoint,
        });

        return acc;
      }, new Set<User>());

      const data = Array.from(completeUsers).reduce((acc: Map<string, User>, user) => {
        acc.set(user.id, user);
        return acc;
      }, new Map<string, User>());

      return data;
    }),
  updateClient: authorizedProcedure
    .input(
      userSchema.partial(),
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
      if (!input.id)
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      if (input.email) {
        const { data: existingUser, error: existingUserError } = await db.from('users').select().eq('email', input.email);
        if (existingUserError)
          throw new Error(existingUserError.message);

        const ids = existingUser.map(user => user.id);

        ids.forEach((id) => {
          if (id !== input.id)
            throw new Error('Email already in use.');
        });
      }

      if (input.phone_number) {
        const { data: existingUser, error: existingUserError } = await db.from('users').select().eq('phone_number', input.phone_number);
        if (existingUserError)
          throw new Error(existingUserError.message);

        const ids = existingUser.map(user => user.id);

        ids.forEach((id) => {
          if (id !== input.id)
            throw new Error('Phone number already in use.');
        });
      }

      const { data: geopointData, error: geopointError } = await db.from('geopoints').upsert(input.geopoint!, {
        onConflict: 'id',
      }).select().single();
      if (geopointError)
        throw new Error(geopointError.message);
      if (!geopointData)
        throw new Error('No geopoint upserted.');

      const updateUserQuery = await db.from('users').update({
        first_name: input.first_name,
        middle_name: input.middle_name,
        last_name: input.last_name,
        phone_number: input.phone_number,
        email: input.email,
        geopoint_id: geopointData.id,
      }).eq('id', input.id).eq('role', 'client').select();
      if (updateUserQuery.error)
        throw new Error(updateUserQuery.error.message);
      if (!updateUserQuery.data)
        throw new Error('No user updated.');
    }),
  updateSelf: authorizedProcedure
    .input(
      userSchema.partial(),
    )
    .output(
      z.void(),
    )
    .mutation(async ({
      ctx: { db, requestor },
      input,
    }) => {
      if (requestor.id !== input.id)
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      if (!input.id)
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      if (input.email) {
        const { data: existingUser, error: existingUserError } = await db.from('users').select().eq('email', input.email);
        if (existingUserError)
          throw new Error(existingUserError.message);

        const ids = existingUser.map(user => user.id);

        ids.forEach((id) => {
          if (id !== input.id)
            throw new Error('Email already in use.');
        });
      }

      if (input.phone_number) {
        const { data: existingUser, error: existingUserError } = await db.from('users').select().eq('phone_number', input.phone_number);
        if (existingUserError)
          throw new Error(existingUserError.message);

        const ids = existingUser.map(user => user.id);

        ids.forEach((id) => {
          if (id !== input.id)
            throw new Error('Phone number already in use.');
        });
      }

      const { data: geopointData, error: geopointError } = await db.from('geopoints').upsert(input.geopoint!, {
        onConflict: 'id',
      }).select().single();
      if (geopointError)
        throw new Error(geopointError.message);
      if (!geopointData)
        throw new Error('No geopoint upserted.');

      const updateUserQuery = await db.from('users').update({
        first_name: input.first_name,
        middle_name: input.middle_name,
        last_name: input.last_name,
        phone_number: input.phone_number,
        email: input.email,
        geopoint_id: geopointData.id,
      }).eq('id', input.id).select();
      if (updateUserQuery.error)
        throw new Error(updateUserQuery.error.message);
      if (!updateUserQuery.data)
        throw new Error('No user updated.');

      const updateAuthQuery = await db.auth.admin.updateUserById(input.id, {
        email: input.email,
      });
      if (updateAuthQuery.error)
        throw new Error(updateAuthQuery.error.message);
    }),
});
