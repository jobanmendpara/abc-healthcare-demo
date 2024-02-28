import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import dayjs from 'dayjs';
import { timecardSchema } from '~/types';
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
        is_active: true,
        assignment_id: input.assignmentId,
        started_at: dayjs().format(),
        created_at: dayjs().format(),
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
      ctx: { db },
      input,
    }) => {
      const {
        data: newTimecard,
        error: updateTimecardError,
      } = await db.from('timecards').update({
        ended_at: dayjs().format(),
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
    .output(
      z.array(timecardSchema),
    )
    .query(async ({
      ctx: { db, requestor },
    }) => {
      if (requestor.role === 'admin') {
        const {
          data: activeTimecards,
          error: selectActiveTimecardsError,
        } = await db.from('timecards').select().eq('is_active', true);
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
          data: assignments,
          error: selectAssignmentsError,
        } = await db.from('assignments').select().eq('employee_id', requestor.id);
        if (selectAssignmentsError) {
          throw new Error('Error while finding assignments');
        }
        if (!assignments) {
          throw new Error('Assignments not found');
        }

        const assignmentIds = assignments.map(assignment => assignment.id);

        const {
          data: activeTimecards,
          error: selectActiveTimecardsError,
        } = await db.from('timecards').select().in('assignment_id', assignmentIds).eq('is_active', true);
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
});
