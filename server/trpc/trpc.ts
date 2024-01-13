import { initTRPC } from '@trpc/server';
import type { H3Event } from 'h3';
import superjson from 'superjson';
import type { AppDatabaseClient, Database } from '~/types';
import { serverSupabaseServiceRole } from '#supabase/server';

interface CreateContextOptions {
  db: AppDatabaseClient
};

function createInnerTRPCContext(opts: CreateContextOptions) {
  return { ...opts };
}

export async function createTRPCContext(event: H3Event) {
  // INFO: Type error if type assertion is removed. May need to revisit later.
  return createInnerTRPCContext({
    db: serverSupabaseServiceRole<Database['public']>(event) as unknown as AppDatabaseClient,
  });
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
