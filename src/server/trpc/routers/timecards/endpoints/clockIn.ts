import crypto from 'node:crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { calculateEuclideanDistance } from '~/utils';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const clockIn = authorizedProcedure
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
      is_active: false,
      verification_code: verificationCode,
    });
    if (insertTimecardError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error while creating timecard',
      });
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
  });
