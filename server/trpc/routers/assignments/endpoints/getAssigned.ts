import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';
import type { Enums } from '~/types';

export const getAssigned = authorizedProcedure.input(
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

    const { data: user, error: userError } = await db.from('users').select('role').eq('id', userId).single();
    if (userError && !user)
      throw new TRPCError({ code: 'NOT_FOUND' });

    const userRole: Enums<'role_enum'> = `${user.role}`;

    if (userRole === 'admin') {
      return [];
    }

    const { data: existingAssignments, error: existingAssignmentsError } = await db
      .from('assignments')
      .select(`
        id,
        client:users!client_id(
          id,
          first_name,
          middle_name,
          last_name,
          geopoint:geopoints(*)
        ),
        employee:users!employee_id(
          id,
          first_name,
          middle_name,
          last_name,
          geopoint:geopoints(*)
        )
      `)
      .eq(`${userRole}_id`, userId)
      .returns<Assignment[]>();
    if (existingAssignmentsError || !existingAssignments)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    return existingAssignments;
    ;
  },
);
