import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const updateEmployee = authorizedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      newIsActiveValue: z.boolean(),
    }),
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

    const updateUserQuery = await db.from('users').update({
      is_active: input.newIsActiveValue,
    }).eq('id', input.id).select();
    if (updateUserQuery.error)
      throw new Error(updateUserQuery.error.message);
    if (!updateUserQuery.data)
      throw new Error('No user updated.');
  });
