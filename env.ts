import { createEnv } from '@t3-oss/env-nuxt';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.string(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string(),
    BASE_URL: z.string().url(),
  },
  client: {},
});
