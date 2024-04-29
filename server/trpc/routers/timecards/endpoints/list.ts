import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const list = authorizedProcedure
  .input(z.object({
    dateRange: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }))
  .query(async ({
    ctx,
    input,
  }) => {
    const { db, requestor } = ctx;
    const { dateRange } = input;

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
    const statement = db.from('timecards')
      .select(query)
      .gte('started_at', `${dateRange.start} 00:00:00`)
      .lte('ended_at', `${dateRange.end} 23:59:59`);

    if (requestor.role === 'admin') {
      const { data: timecards, error: selectTimecardsError } = await statement
        .order('started_at', { ascending: false })
        .returns<Timecard[]>();
      ;
      if (selectTimecardsError) {
        throw new Error(selectTimecardsError.message);
      }
      if (!timecards) {
        throw new Error('No timecards returned.');
      }

      const { data: nextPage, error: nextPageError } = await db.from('timecards')
        .select();
      if (nextPageError)
        throw new Error(nextPageError.message);
      if (!nextPage)
        throw new Error('No next page returned.');

      return timecards;
    }

    if (requestor.role === 'employee') {
      const { data: assignments, error: selectAssignmentsError } = await db.from('assignments')
        .select('id')
        .eq('employee_id', requestor.id);
      if (selectAssignmentsError) {
        throw new Error(selectAssignmentsError.message);
      }
      if (!assignments) {
        throw new Error('No assignments returned.');
      }

      const assignmentIds = assignments.map(assignment => assignment.id);

      const { data: timecards, error: selectTimecardsError } = await statement
        .in('assignment_id', assignmentIds)
        .order('started_at', { ascending: false })
        .returns<Timecard[]>();
      ;
      if (selectTimecardsError) {
        throw new Error(selectTimecardsError.message);
      }
      if (!timecards) {
        throw new Error('No timecards returned.');
      }

      const { data: nextPage, error: nextPageError } = await db.from('timecards')
        .select();
      if (nextPageError)
        throw new Error(nextPageError.message);
      if (!nextPage)
        throw new Error('No next page returned.');

      return timecards;
    }

    return [];
  });
