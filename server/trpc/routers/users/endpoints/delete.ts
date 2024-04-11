import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const deleteUser = authorizedProcedure
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
    const { userIds } = input;

    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const { error } = await db.from('users').delete().in('id', userIds);
    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
  });
