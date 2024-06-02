import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { initUserSettings } from '~/utils';
import type { Tables } from '~/types';
import { userSchema } from '~/types';

export const create = authorizedProcedure
  .input(
    z.object({
      user: userSchema,
    }),
  ).output(
    z.void(),
  ).mutation(async ({
    ctx: { db, requestor },
    input: { user },
  }) => {
    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const newUser: Tables<'users'> = {
      id: user.id,
      role: user.role,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      is_active: true,
      geopoint_id: user.geopoint.id,
    };
    const geopoint = user.geopoint;
    const insertGeopointQuery = await db.from('geopoints').upsert(geopoint, {
      onConflict: 'id',
    }).select();
    if (insertGeopointQuery.error)
      throw new Error(insertGeopointQuery.error.message);

    const insertUserQuery = await db.from('users').insert(newUser).select();
    if (insertUserQuery.error)
      throw new Error(insertUserQuery.error.message);

    const initialUserSettings = initUserSettings(user.id);
    const insertUserSettingsQuery = await db.from('user_settings').insert(initialUserSettings).select();
    if (insertUserSettingsQuery.error)
      throw new Error(insertUserSettingsQuery.error.message);
  });
