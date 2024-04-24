import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const getById = authorizedProcedure
  .input(
    z.object({
      userIds: z.array(z.string().uuid()),
    }),
  )
  .query(async ({
    ctx: { db },
    input: { userIds },
  }) => {
    const { data: users, error } = await db.from('users')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        email,
        phone_number,
        role,
        geopoint:geopoints!geopoint_id(*),
        is_active
      `)
      .in('id', userIds)
      .order('last_name', { ascending: true })
      .returns<User[]>();
    if (error)
      throw new Error(error.message);

    const output = new Map<string, User>();
    users.forEach(user => output.set(user.id, user));

    return output;
  });
