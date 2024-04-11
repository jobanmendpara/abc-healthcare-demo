import { z } from 'zod';
import { emailLoginSchema } from '~/types';
import { publicProcedure } from '~/server/trpc/trpc';

export const loginWithEmail = publicProcedure
  .input(
    emailLoginSchema,
  )
  .output(z.object({
    user: z.unknown(),
    session: z.unknown(),
  }))
  .mutation(async ({ ctx: { db }, input }) => {
    const { data, error } = await db.auth.signInWithPassword(input);

    if (error)
      throw new Error(error.message);
    if (!data || !data.user || !data.session)
      throw new Error('No data returned.');

    return data;
  });
