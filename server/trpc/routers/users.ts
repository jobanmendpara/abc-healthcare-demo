import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { appRouter } from '../root';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
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
        page: z.number().int().positive(),
        size: z.number().int().positive(),
      }),
    ).output(z.object({
      list: z.array(userSchema),
      hasNextPage: z.boolean(),
    }))
    .query(async ({
      ctx,
      input: { role, page, size },
    }) => {
      const { db, requestor } = ctx;
      const caller = appRouter.createCaller(ctx);

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

      const { data } = await caller.users.getById({ userIds: users.map(user => user.id) });

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
      z.object({
        data: z.map(z.string().uuid(), userSchema),
      }),
    ).query(async ({
      ctx: { db, requestor },
      input: { userIds },
    }) => {
      if (requestor.role !== 'admin')
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

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
        const assignments = user.role === 'employee'
          ? employeeAssignments.filter(assignment => assignment.employee_id === user.id)
          : clientAssignments.filter(assignment => assignment.client_id === user.id);

        acc.add({
          ...user,
          geopoint,
          assignments,
        });

        return acc;
      }, new Set<User>());

      const data = Array.from(completeUsers).reduce((acc: Map<string, User>, user) => {
        acc.set(user.id, user);
        return acc;
      }, new Map<string, User>());

      return {
        data,
      };
    }),
});
