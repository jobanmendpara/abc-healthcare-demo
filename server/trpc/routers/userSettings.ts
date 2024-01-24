import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { userSettingsSchema } from '~/types';

export const userSettingsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({
      userIds: z.array(z.string().uuid()),
    }))
    .output(z.object({
      userSettings: z.array(userSettingsSchema),
    }))
    .query(async ({ ctx: { db }, input: { userIds } }) => {
      const { data, error } = await db.from('user_settings').select().in('id', userIds);
      if (error)
        throw new Error(error.message);
      if (!data)
        throw new Error('No data returned.');

      return {
        userSettings: data,
      };
    }),
  update: publicProcedure
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
