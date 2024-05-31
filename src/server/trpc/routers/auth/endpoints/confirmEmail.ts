import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '~/server/trpc/trpc';

export const confirmEmail = publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx: { db },
    input: { email },
  }) => {
    const {
      data: user,
      error: selectUserErorr,
    } = await db.from('users').select('id').eq('email', email).single();
    if (selectUserErorr) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const {
      data: authUser,
      error: authUserError,
    } = await db.auth.admin.getUserById(user.id);
    if (authUserError) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
    if (!authUser) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    if (authUser.user.email_confirmed_at) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User\'s email is already confirmed.',
      });
    }

    const { data, error } = await db.auth.admin.updateUserById(authUser.user.id, {
      email_confirm: true,
    });
    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
    if (!data) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
  });
