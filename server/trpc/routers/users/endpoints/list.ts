import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { appRouter } from '~~/server/trpc/root';
import { roleEnumSchema, userSchema } from '~/types';
import { authorizedProcedure } from '~/server/trpc/trpc';
import { calculatePageRange } from '~/utils';

export const list = authorizedProcedure
  .input(
    z.object({
      role: roleEnumSchema,
      page: z.number().int().positive().default(1),
      perPage: z.number().int().positive().default(10),
    }),
  ).output(z.object({
    list: z.array(userSchema.partial()),
    hasNextPage: z.boolean(),
  }))
  .query(async ({
    ctx,
    input: { role, page, perPage },
  }) => {
    const { db, requestor } = ctx;
    const caller = appRouter.createCaller(ctx);

    if (requestor.role !== 'admin')
      throw new TRPCError({ code: 'PRECONDITION_FAILED' });

    const { start, end } = calculatePageRange(page, perPage);

    const { data: users, error: usersError } = await db.from('users')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        role,
        email,
        phone_number,
        geopoint:geopoints!geopoint_id(*)
      `)
      .order('last_name', { ascending: true })
      .eq('role', role)
      .neq('id', requestor.id)
      .range(start, end);
    if (usersError)
      throw new Error(usersError.message);
    if (!users)
      throw new Error('No users returned.');

    const { data: nextPage, error: nextPageError } = await db.from('users')
      .select()
      .eq('role', role)
      .range(end, end + 1);
    if (nextPageError)
      throw new Error(nextPageError.message);
    if (!nextPage)
      throw new Error('No next page returned.');

    const data = await caller.users.getById({ userIds: users.map(user => user.id) });

    const list: User[] = Array.from(data.values());

    return {
      list,
      hasNextPage: nextPage.length > 0,
    };
  });
