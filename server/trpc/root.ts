import { createTRPCRouter } from './trpc';
import {
  assignmentsRouter,
  authRouter,
  invitesRouter,
  timecardsRouter,
  userSettingsRouter,
  usersRouter,
} from '~/server/trpc/routers';

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
