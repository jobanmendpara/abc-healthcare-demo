import { initTRPC } from '@trpc/server';
import type { H3Event } from 'h3';
import superjson from 'superjson';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/models/supabase';
import { serverSupabaseClient } from '#supabase/server';

interface CreateContextOptions {
  db: SupabaseClient<Database>
};

function createInnerTRPCContext(opts: CreateContextOptions) {
  return { ...opts };
}

export async function createTRPCContext(event: H3Event) {
  return createInnerTRPCContext({
    db: await serverSupabaseClient<Database>(event),
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
