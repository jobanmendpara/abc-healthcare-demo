import { z } from 'zod';
import { publicProcedure } from '~/server/trpc/trpc';

export const loginWithMagicLink = publicProcedure
  .input(z.object({
    email: z.string().email(),
    token: z.string(),
  }))
  .output(z.object({
    user: z.unknown(),
    session: z.unknown(),
  }))
  .mutation(async ({
    ctx: { db },
    input,
  }) => {
    const { data, error } = await db.auth.verifyOtp({
      type: 'magiclink',
      email: input.email,
      token: input.token,
    });
    if (error)
      throw new Error(error.message);

    return data;
  });
