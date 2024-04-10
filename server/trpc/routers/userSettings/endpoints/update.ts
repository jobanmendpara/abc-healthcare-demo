import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { userSettingsSchema } from '~/types';

export const update = authorizedProcedure
  .input(z.object({
    userSettings: z.array(userSettingsSchema),
  }))
  .output(z.void())
  .mutation(async ({ ctx: { db }, input: { userSettings } }) => {
    userSettings.forEach(async (userSetting) => {
      const { data, error } = await db.from('user_settings').update(userSetting).eq('id', userSetting.id).select();
      if (error)
        throw new Error(error.message);
      if (!data)
        throw new Error('No data returned.');
    });
  });
