import crypto from 'node:crypto';
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
    .output(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({
      ctx: { db, requestor, twilio },
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

      const { error: deleteUnverifiedTimecards } = await db.from('timecards')
        .delete()
        .eq('assignment_id', input.assignmentId)
        .neq('verification_code', null);
      if (deleteUnverifiedTimecards) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const id = crypto.randomUUID();
      const { error: insertTimecardError } = await db.from('timecards').insert({
        id,
        assignment_id: input.assignmentId,
        started_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        is_active: false,
        verification_code: verificationCode,
      });
      if (insertTimecardError) {
        throw new Error('Error while creating timecard');
      }

      await twilio.messages.create({
        to: `+1${client.phone_number}`,
        from: useRuntimeConfig().twilioPhone as string,
        body: `
              ${requestor.first_name} is clocking in. Please give them the following code: ${verificationCode}.
              `,
      });

      return {
        id,
      };
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
  verifyClockIn: authorizedProcedure
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
    }),
});
