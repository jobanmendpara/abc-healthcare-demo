import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { userSchema } from '~/types';

export const getById = authorizedProcedure
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
  });
