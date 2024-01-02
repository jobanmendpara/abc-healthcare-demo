import { z } from 'zod';
import type { QueryData } from '@supabase/supabase-js';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { getUnknownErrorMessage } from '~/utils/errorHandling';
import type { User } from '~/models';
import { AppErrorSchema, UserRolesEnum, UserSchema } from '~/models';

export const usersRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
      }),
    )
    .output(
      z.array(UserSchema).or(AppErrorSchema),
    )
    .query(async ({ ctx: { db }, input: { userIds } }) => {
      try {
        const users: User[] = [];
        const query = db.from('users').select(
          `
            *,
            locations (*)
          `,
        ).in('id', userIds);
        const { data, error } = await query;
        let rows: QueryData<typeof query> = [];

        if (error)
          throw new Error(error.message);
        if (!data || data.length < 1)
          throw new Error('No Data Found');

        rows = data;
        for (const row of rows) {
          users.push({
            id: row.id,
            role: row.role,
            email: row.email,
            address: {
              id: row.locations!.id,
              latitude: row.locations?.latitude ?? 0,
              longitude: row.locations?.longitude ?? 0,
              formattedAddress: row.locations?.formatted_address ?? '',
              aptNumber: row.locations?.apt_number ?? '',
            },
            lastName: row.last_name,
            firstName: row.first_name,
            middleName: row.middle_name ?? '',
            phoneNumber: row.phone_number ?? '',
          });
        }

        return users;
      }
      catch (error) {
        return {
          message: getUnknownErrorMessage(error),
        };
      }
    }),
  invite: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: UserRolesEnum,
      }),
    )
    .output(
      z.void().or(AppErrorSchema),
    )
    .mutation(async ({ ctx: { db }, input: { email, role } }) => {
      try {
        const query = db.from('invites').upsert({
          id: crypto.randomUUID(),
          email,
          role,
        }, {
          onConflict: 'email',
        }).select();

        const { data, error } = await query;

        if (error)
          throw new Error(error.message);
        if (!data)
          throw new Error('Unable to invite user.');
      }
      catch (error) {
        return {
          message: getUnknownErrorMessage(error),
        };
      }
    }),
});
