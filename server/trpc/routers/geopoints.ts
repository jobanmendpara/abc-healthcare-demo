import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import type { Geopoint } from '~/types';
import { geopointSchema } from '~/types';

export const geopointsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .output(z.object({
      geopoints: z.record(z.string(), geopointSchema),
    }))
    .query(async ({ ctx: { db }, input }) => {
      const selectGeopointQuery = await db.from('geopoints').select().in('id', input.ids);
      if (selectGeopointQuery.error)
        throw new Error(selectGeopointQuery.error.message);
      if (!selectGeopointQuery.data)
        throw new Error('No data returned.');

      return {
        geopoints: selectGeopointQuery.data.reduce((acc: Record<string, Geopoint>, geopoint) => {
          acc[geopoint.id] = geopoint;
          return acc;
        }, {}),
      };
    }),
});
