import { z } from 'zod';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const clockOut = authorizedProcedure
  .input(
    z.object({
      timecardId: z.string().uuid(),
    }),
  )
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx: { db, requestor },
    input,
  }) => {
    if (requestor.role !== 'employee') {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const {
      data: newTimecard,
      error: updateTimecardError,
    } = await db.from('timecards').update({
      ended_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      is_active: false,
    }).eq('id', input.timecardId).select().single();
    if (updateTimecardError) {
      throw new Error('Error while updating timecard');
    }
    if (!newTimecard) {
      throw new Error('Timecard not found');
    }
  });
