import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { invitesTableSchema } from '~/types';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const invite = authorizedProcedure
  .input(
    invitesTableSchema,
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

    const { id: token, email, role } = input;
    const redirectTo = `${useRuntimeConfig().public.baseUrl}/signup?token=${token}&email=${email}`;

    const checkIfUserExistsQueryResult = await db.from('users').select().eq('email', email);
    if (checkIfUserExistsQueryResult.error)
      throw new Error(checkIfUserExistsQueryResult.error.message);
    if (checkIfUserExistsQueryResult.data.length > 0)
      throw new Error('User already exists.');

    const inviteUserResults = await db.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });
    if (inviteUserResults.error)
      throw new Error(inviteUserResults.error.message);

    const { id } = inviteUserResults.data.user;

    await db.from('invites').upsert(
      {
        id,
        email,
        role,
        token,
      },
      {
        onConflict: 'email',
      },
    ).select();
  });
