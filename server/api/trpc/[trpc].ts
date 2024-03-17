import { createNuxtApiHandler } from 'trpc-nuxt';

import { appRouter } from '~~/server/trpc/root';
import { createTRPCContext } from '~/server/trpc/context';

export default createNuxtApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    useRuntimeConfig().public.nodeEnv === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
          );
        }
      : undefined,
});
