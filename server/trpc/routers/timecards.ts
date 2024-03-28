import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import dayjs from 'dayjs';
import { authorizedProcedure, createTRPCRouter } from '~/server/trpc/trpc';
import { calculateEuclideanDistance } from '~/utils';

export const timecardsRouter = createTRPCRouter({
  clockIn: authorizedProcedure
    .input(z.object({
      assignmentId: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    }))
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

      const { data: assignment, error: selectAssignmentError } = await db.from('assignments').select().eq('id', input.assignmentId).single();
      if (selectAssignmentError) {
        throw new Error('Error while finding assignment');
      }
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      if (assignment.employee_id !== requestor.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const { data: client, error: selectClientError } = await db.from('users').select().eq('id', assignment.client_id).single();
      if (selectClientError) {
        throw new Error('Error while finding client');
      }
      if (!client) {
        throw new Error('Client not found');
      }

      const { data: clientGeopoint, error: selectClientGeopointError } = await db.from('geopoints').select().eq('id', client.geopoint_id).single();
      if (selectClientGeopointError) {
        throw new Error('Error while finding client geopoint');
      }
      if (!clientGeopoint) {
        throw new Error('Client geopoint not found');
      }

      const distance = calculateEuclideanDistance(
        [input.latitude, input.longitude],
        [clientGeopoint.latitude!, clientGeopoint.longitude!],
      );

      if (distance > 0.1) {
        throw new Error('You are too far from the client');
      }

      const { error: insertTimecardError } = await db.from('timecards').insert({
        id: crypto.randomUUID(),
        assignment_id: input.assignmentId,
        started_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      });
      if (insertTimecardError) {
        throw new Error('Error while creating timecard');
      }
    }),
  clockOut: authorizedProcedure
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
    }),
  getActive: authorizedProcedure
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
    }),
  list: authorizedProcedure
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
            created_at,
            is_active
      `;
      const statement = db.from('timecards').select(query).gte('started_at', dateRange.start).lte('ended_at', dateRange.end);

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
    }),
});
