import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { userSchema } from '~/types';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const updateClient = authorizedProcedure
  .input(
    userSchema.partial(),
  )
  .output(
    z.void(),
  )
  .mutation(async ({
    ctx: { db, requestor },
    input,
  }) => {
    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });
    if (!input.id)
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    if (input.email) {
      const { data: existingUser, error: existingUserError } = await db.from('users').select().eq('email', input.email);
      if (existingUserError)
        throw new Error(existingUserError.message);

      const ids = existingUser.map(user => user.id);

      ids.forEach((id) => {
        if (id !== input.id)
          throw new Error('Email already in use.');
      });
    }

    if (input.phone_number) {
      const { data: existingUser, error: existingUserError } = await db.from('users').select().eq('phone_number', input.phone_number);
      if (existingUserError)
        throw new Error(existingUserError.message);

      const ids = existingUser.map(user => user.id);

      ids.forEach((id) => {
        if (id !== input.id)
          throw new Error('Phone number already in use.');
      });
    }

    const { data: geopointData, error: geopointError } = await db.from('geopoints').upsert(input.geopoint!, {
      onConflict: 'id',
    }).select().single();
    if (geopointError)
      throw new Error(geopointError.message);
    if (!geopointData)
      throw new Error('No geopoint upserted.');

    const updateUserQuery = await db.from('users').update({
      first_name: input.first_name,
      middle_name: input.middle_name,
      last_name: input.last_name,
      phone_number: input.phone_number,
      email: input.email,
      geopoint_id: geopointData.id,
    }).eq('id', input.id).eq('role', 'client').select();
    if (updateUserQuery.error)
      throw new Error(updateUserQuery.error.message);
    if (!updateUserQuery.data)
      throw new Error('No user updated.');
  });
