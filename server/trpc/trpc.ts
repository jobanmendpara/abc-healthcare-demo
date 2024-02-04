import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { createTRPCContext } from './context';

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const authorizedProcedure = publicProcedure
  .use(async ({
    ctx,
    next,
  }) => {
    const { db, token } = ctx;

    if (!token)
      throw new TRPCError({ code: 'UNAUTHORIZED' });

    const { data: { user: auth }, error } = await db.auth.getUser(token);
    if (error)
      throw new Error(error.message);
    if (!auth)
      throw new TRPCError({ code: 'UNAUTHORIZED' });

    const { data: requestor, error: userInfoError } = await db.from('users').select().eq('id', auth.id).single();
    if (userInfoError)
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (!requestor)
      throw new TRPCError({ code: 'UNAUTHORIZED' });

    return next({ ctx: { db, requestor } });
  });
