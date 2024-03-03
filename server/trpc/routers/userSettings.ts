import { z } from 'zod';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
import { userSettingsSchema } from '~/types';

export const userSettingsRouter = createTRPCRouter({
  get: authorizedProcedure
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
    }),
  update: authorizedProcedure
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
    }),
});
