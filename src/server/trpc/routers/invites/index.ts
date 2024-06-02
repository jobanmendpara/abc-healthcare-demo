import endpoints from './endpoints';
import { createTRPCRouter } from '~/server/trpc/trpc';

export const invitesRouter = createTRPCRouter({
  ...endpoints,
});
