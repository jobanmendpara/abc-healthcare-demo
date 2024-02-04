import type { H3Event } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';
import type { AppDatabaseClient, Database } from '~/types';

interface CreateContextOptions {
  db: AppDatabaseClient
  token?: string
  refresh?: string
};

function createInnerTRPCContext(opts: CreateContextOptions) {
  return { ...opts };
}

export async function createTRPCContext(event: H3Event) {
  let token: string | undefined;
  let refresh: string | undefined;

  // INFO: Type error if type assertion is removed. May need to revisit later.
  const db = serverSupabaseServiceRole<Database['public']>(event) as unknown as AppDatabaseClient;
  const cookie = event.headers.get('Cookie');

  if (cookie) {
    const tokenPrefix = cookie.split('sb-access-token=')[1];
    const refreshPrefix = cookie.split('sb-refresh-token=')[1];
    if (tokenPrefix)
      token = tokenPrefix.split(';')[0];

    if (refreshPrefix)
      refresh = refreshPrefix.split(';')[0];
  }

  const ctx = {
    db,
    token,
    refresh,
  };

  return createInnerTRPCContext(ctx);
}
