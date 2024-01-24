import { createTRPCRouter } from './trpc';
import { assignmentsRouter, authRouter, geopointsRouter, userSettingsRouter, usersRouter } from '~/server/trpc/routers';

export const appRouter = createTRPCRouter({
  assignments: assignmentsRouter,
  auth: authRouter,
  users: usersRouter,
  userSettings: userSettingsRouter,
  geopoints: geopointsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
