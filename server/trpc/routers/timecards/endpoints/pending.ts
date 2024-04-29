import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const pending = authorizedProcedure
  .input(
    z.void(),
  )
  .query(async ({
    ctx,
  }) => {
    const { db, requestor } = ctx;

    if (requestor.role !== 'admin') {
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });
    }

    const query = `
            id,
            assignment:assignments(
              id,
              client:users!client_id(
                id,
                first_name,
                last_name
              ),
              employee:users!employee_id(
                id,
                first_name,
                last_name
              )
            ),
            started_at,
            ended_at,
            is_active,
            edited_count
      `;
    const { data, error } = await db.from('timecards')
      .select(query)
      .eq('is_active', true)
      .is('ended_at', null)
      .is('verification_code', null)
      .returns<Timecard[]>();
    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
    if (!data) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return data;
  });
