import { createTRPCRouter } from './trpc';
import { authRouter, usersRouter } from '~/server/trpc/routers';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
