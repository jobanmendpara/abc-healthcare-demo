import { createTRPCRouter } from './trpc';
import { usersRouter } from '~/server/trpc/routers/users';

export const appRouter = createTRPCRouter({
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
