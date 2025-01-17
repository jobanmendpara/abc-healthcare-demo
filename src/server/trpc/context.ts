import type { H3Event } from 'h3';
import twilio from 'twilio';
import { serverSupabaseServiceRole } from '#supabase/server';
import type { AppDatabaseClient, Database } from '~/types';

interface CreateContextOptions {
  db: AppDatabaseClient;
  token?: string;
  refresh?: string;
  twilio: twilio.Twilio;
};

function createInnerTRPCContext(opts: CreateContextOptions) {
  return { ...opts };
}

export async function createTRPCContext(event: H3Event): Promise<CreateContextOptions> {
  let token: string | undefined;
  let refresh: string | undefined;

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

  const twilioClient = twilio(
    useRuntimeConfig().twilioAccountSid as string,
    useRuntimeConfig().twilioAuthToken as string,
  );

  const ctx = {
    db,
    token,
    refresh,
    twilio: twilioClient,
  };

  return createInnerTRPCContext(ctx);
}
