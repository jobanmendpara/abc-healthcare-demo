import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
import { invitesTableSchema } from '~/types';
import { calculatePageRange } from '~/utils/calculators';

export const invitesRouter = createTRPCRouter({
  list: authorizedProcedure.input(z.object({
    page: z.number().int().positive(),
    size: z.number().int().positive(),
  })).output(z.object({
    list: z.array(invitesTableSchema),
    hasNextPage: z.boolean(),
  })).query(async ({ ctx: { db, requestor }, input: { page, size } }) => {
    if (requestor.role !== 'admin')
      throw new TRPCError(({ code: 'PRECONDITION_FAILED' }));

    const { start, end } = calculatePageRange(page, size);

    const { data, error } = await db.from('invites').select().order('email').range(start, end);
    if (error)
      throw error;

    const { data: nextPage, error: nextPageError } = await db.from('invites').select().range(end, end + 1);
    if (nextPageError)
      throw nextPageError;

    return {
      list: data,
      hasNextPage: nextPage.length > 0,
    };
  }),
});
