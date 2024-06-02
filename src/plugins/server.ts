import superjson from 'superjson';
import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client';

import type { AppRouter } from '~/server/trpc/root';

export const api = createTRPCNuxtClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});

export default defineNuxtPlugin(() => {
  const clientAPI = api;

  return {
    provide: {
      api: clientAPI,
    },
  };
});
