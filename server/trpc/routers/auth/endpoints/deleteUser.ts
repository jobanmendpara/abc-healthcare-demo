import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { appRouter } from '~/server/trpc/root';

export const deleteUser = authorizedProcedure
  .input(z.object({
    id: z.string().uuid(),
  }))
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx,
    input: { id },
  }) => {
    const { db, requestor } = ctx;
    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const caller = appRouter.createCaller(ctx);

    const { data: deletedUser, error } = await db
      .from('users')
      .select('role')
      .eq('id', id)
      .single();
    if (error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });

    await caller.users.delete({ userIds: [id] });

    if (deletedUser.role !== 'client') {
      const deleteAuthResults = await db.auth.admin.deleteUser(id);
      if (deleteAuthResults.error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: deleteAuthResults.error.message,
        });
    }
  });
