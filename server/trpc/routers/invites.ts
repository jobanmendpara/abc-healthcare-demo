import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { inviteFormDataSchema } from '~/types';
import { calculatePageRange } from '~/utils/calculators';

export const invitesRouter = createTRPCRouter({
  list: publicProcedure.input(z.object({
    page: z.number().int().positive(),
    size: z.number().int().positive(),
  })).output(z.object({
    data: z.array(inviteFormDataSchema),
  })).query(async ({ ctx: { db }, input: { page, size } }) => {
    const { start, end } = calculatePageRange(page, size);

    const { data, error } = await db.from('invites').select().order('email').range(start, end);
    if (error)
      throw error;

    return {
      data,
    };
  }),
});
