import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { appRouter } from '~/server/trpc/root';
import { authorizedProcedure } from '~/server/trpc/trpc';
import type { Enums } from '~/types';

export const getAvailableSchema = z.array(
  z.object({
    id: z.string().uuid(),
    first_name: z.string(),
    middle_name: z.string().nullish(),
    last_name: z.string(),
  }),
);
export type GetAvailableReturn = z.infer<typeof getAvailableSchema>;

export const getAvailable = authorizedProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
    }),
  )
  .output(
    getAvailableSchema,
  )
  .query(async ({
    ctx,
    input,
  }) => {
    const { userId } = input;
    const { db } = ctx;
    const caller = appRouter.createCaller(ctx);

    const allowedRoles: Enums<'role_enum'>[] = ['admin', 'employee'];

    if (!allowedRoles.includes(ctx.requestor.role))
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const { data: user, error: userError } = await db.from('users').select('role').eq('id', userId).single();
    if (userError)
      throw new TRPCError({ code: 'NOT_FOUND' });
    if (!user)
      throw new TRPCError({ code: 'NOT_FOUND' });

    const assignments = await caller.assignments.getAssigned({ userId });
    const oppositeRole = user.role === 'employee' ? 'client' : 'employee';

    const assignedUserIds = assignments.reduce((acc: string[], assignment) => {
      acc.push(assignment[oppositeRole].id);
      return acc;
    }, []);

    const { data: assignableUsers, error: assignableUsersError } = await db.from('users')
      .select(`
          id,
          first_name,
          middle_name,
          last_name
        `)
      .not('id', 'in', `(${assignedUserIds.join(',')})`).eq('role', oppositeRole);
    if (assignableUsersError)
      throw new TRPCError({ code: 'NOT_FOUND', cause: assignableUsersError });

    const output: GetAvailableReturn = assignableUsers;

    return output;
  });
