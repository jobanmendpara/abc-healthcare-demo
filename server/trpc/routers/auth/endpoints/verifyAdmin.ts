import { z } from 'zod';
import { authorizedProcedure } from '~/server/trpc/trpc';

export const verifyAdmin = authorizedProcedure
  .input(
    z.void(),
  )
  .output(
    z.boolean(),
  )
  .query(async ({
    ctx: { requestor },
  }) => {
    return requestor.role === 'admin';
  });
