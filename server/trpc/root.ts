import { createTRPCRouter } from './trpc';
import {
  assignmentsRouter,
  authRouter,
  geopointsRouter,
  invitesRouter,
  userSettingsRouter,
  usersRouter,
} from '~/server/trpc/routers';

export const appRouter = createTRPCRouter({
  assignments: assignmentsRouter,
  auth: authRouter,
  geopoints: geopointsRouter,
  invites: invitesRouter,
  users: usersRouter,
  userSettings: userSettingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
