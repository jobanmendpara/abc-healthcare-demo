import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const deleteTimecard = authorizedProcedure
  .input(z.string().uuid())
  .mutation(async ({
    ctx,
    input,
  }) => {
    const { db, requestor } = ctx;

    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const { error } = await db
      .from('timecards')
      .delete()
      .eq('id', input);
    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  });
