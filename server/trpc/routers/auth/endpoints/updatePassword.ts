import { z } from 'zod';
import { changePasswordRequestSchema } from '~/types';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const updatePassword = authorizedProcedure
  .input(
    changePasswordRequestSchema,
  )
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx: { db, requestor },
    input: { oldPassword, newPassword },
  }) => {
    const verifyLoginQuery = await db.auth.signInWithPassword({
      email: requestor.email,
      password: oldPassword,
    });
    if (verifyLoginQuery.error)
      throw new Error(verifyLoginQuery.error.message);

    const updatePasswordQuery = await db.auth.admin.updateUserById(requestor.id, {
      password: newPassword,
    });
    if (updatePasswordQuery.error)
      throw new Error(updatePasswordQuery.error.message);
  });
