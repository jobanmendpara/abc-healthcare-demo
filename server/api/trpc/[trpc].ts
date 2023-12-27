import { createNuxtApiHandler } from 'trpc-nuxt';

import { env } from '~/env';
import { appRouter } from '~~/server/trpc/root';
import { createTRPCContext } from '~~/server/trpc/trpc';

export default createNuxtApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
          );
        }
      : undefined,
});
