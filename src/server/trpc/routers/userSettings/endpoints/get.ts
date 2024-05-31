import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { userSettingsSchema } from '~/types';

export const get = authorizedProcedure
  .output(z.object({
    userSettings: z.array(userSettingsSchema),
  }))
  .query(async ({ ctx }) => {
    const { db, requestor } = ctx;
    const { data, error } = await db.from('user_settings').select().eq('id', requestor.id);
    if (error)
      throw new Error(error.message);
    if (!data)
      throw new Error('No data returned.');

    return {
      userSettings: data,
    };
  });
