import {
  assignmentsRouter,
  authRouter,
  invitesRouter,
  timecardsRouter,
  userSettingsRouter,
  usersRouter,
} from '~/server/trpc/routers';
import { createTRPCRouter } from '~/server/trpc/trpc';

export const appRouter = createTRPCRouter({
  assignments: assignmentsRouter,
  auth: authRouter,
  invites: invitesRouter,
  timecards: timecardsRouter,
  users: usersRouter,
  userSettings: userSettingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
