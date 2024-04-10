import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '~/server/trpc/trpc';

export const verify = publicProcedure
  .input(
    z.string().uuid(),
  )
  .output(
    z.boolean(),
  )
  .query(async ({
    ctx: { db },
    input,
  }) => {
    const { data, error } = await db.from('invites').select().eq('token', input);
    if (error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    return data.length > 0;
  });
