import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { AppDateFormats } from '~/types';

export const update = authorizedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      newStartedValue: z.date(),
      newEndedValue: z.date(),
    }),
  )
  .mutation(async ({
    ctx,
    input,
  }) => {
    const { db, requestor } = ctx;
    if (requestor.role !== 'admin') {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const { data: getCountData, error: getCountError } = await db
      .from('timecards')
      .select('edited_count')
      .eq('id', input.id)
      .single();
    if (getCountError) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
    if (!getCountData) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const { error } = await db
      .from('timecards')
      .update({
        started_at: dayjs(input.newStartedValue).format(AppDateFormats.SERVER),
        ended_at: dayjs(input.newEndedValue).format(AppDateFormats.SERVER),
        edited_count: getCountData.edited_count + 1,
        is_active: false,
      })
      .eq('id', input.id);
    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
  });
