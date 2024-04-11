import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const deleteInvite = authorizedProcedure
  .input(z.object({
    ids: z.array(z.string().uuid()),
  }))
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx: { db, requestor },
    input: { ids },
  }) => {
    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const deleteInviteResults = await db.from('invites').delete().in('id', ids);
    if (deleteInviteResults.error)
      throw new Error(deleteInviteResults.error.message);

    ids.forEach(async (id) => {
      const deleteAuthResults = await db.auth.admin.deleteUser(id);
      if (deleteAuthResults.error)
        throw new Error(deleteAuthResults.error.message);
    });
  });
