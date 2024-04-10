import { z } from 'zod';
import dayjs from 'dayjs';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const verifyClockIn = authorizedProcedure
  .input(z.object({
    timecardId: z.string().uuid(),
    verificationCode: z.string().length(4),
  }))
  .mutation(async ({
    ctx: { db },
    input,
  }) => {
    const {
      data: timecard,
      error: selectTimecardError,
    } = await db.from('timecards')
      .select()
      .eq('id', input.timecardId).single();

    if (selectTimecardError) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: selectTimecardError.message,
      });
    }
    if (!timecard) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Timecard not found',
      });
    }

    if (timecard.is_active) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
      });
    }

    if (timecard.verification_code === null) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Timecard has been verified already',
      });
    }

    if (timecard.verification_code !== input.verificationCode) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Incorrect verification code',
      });
    }

    const {
      data: verifiedTimecard,
      error: updateTimecardError,
    } = await db.from('timecards').update({
      ...timecard,
      started_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      is_active: true,
      verification_code: null,
    }).eq('id', input.timecardId).select();
    if (updateTimecardError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: updateTimecardError.message,
      });
    }
    if (!verifiedTimecard) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Timecard not found',
      });
    }
  });
