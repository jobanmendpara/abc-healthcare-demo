import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const getActive = authorizedProcedure
  .input(z.void())
  .query(async ({
    ctx: { db, requestor },
  }) => {
    if (requestor.role === 'admin') {
      const {
        data: activeTimecards,
        error: selectActiveTimecardsError,
      } = await db.from('timecards')
        .select(`
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
            created_at,
            is_active
          `)
        .eq('is_active', true);
      if (selectActiveTimecardsError) {
        throw new Error('Error while finding active timecards');
      }
      if (!activeTimecards) {
        throw new Error('Active timecards not found');
      }

      return activeTimecards;
    }

    if (requestor.role === 'employee') {
      const {
        data: activeTimecards,
        error: selectActiveTimecardsError,
      } = await db.from('timecards')
        .select(`
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
            created_at,
            is_active
          `)
        .eq('is_active', true);
      if (selectActiveTimecardsError) {
        throw new Error('Error while finding active timecards');
      }
      if (!activeTimecards) {
        throw new Error('Active timecards not found');
      }

      return activeTimecards;
    }

    return [];
  });
