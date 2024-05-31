import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const getAll = authorizedProcedure
  .input(
    z.void(),
  )
  .query(async ({
    ctx,
  }) => {
    const { db, requestor } = ctx;

    if (requestor.role !== 'admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You do not have permission',
      });
    }

    const { data, error } = await db.from('users')
      .select(`
        *,
        geopoint:geopoints(*)
      `)
      .order('last_name', { ascending: true })
      .neq('id', requestor.id);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Trouble fetching users',
      });
    }

    return data.map((user) => {
      const { geopoint_id: _geopoint_id, ...modifiedUser } = user;

      return modifiedUser;
    });
  });
