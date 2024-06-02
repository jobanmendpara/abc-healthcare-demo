import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '~/server/trpc/trpc';

export const getMagicLink = publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx: { db },
    input,
  }) => {
    const existingUser = await db.from('users').select().eq('email', input.email).single();
    if (existingUser.error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    if (!existingUser.data)
      throw new TRPCError({ code: 'NOT_FOUND' });

    const magicLink = await db.auth.signInWithOtp({
      email: input.email,
      options: {
        emailRedirectTo: `${useRuntimeConfig().public.baseUrl}/login?email=${input.email}`,
        shouldCreateUser: false,
      },
    });
    if (magicLink.error)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
  });
