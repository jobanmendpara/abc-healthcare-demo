import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import { api } from '~/plugins/server';

export const queries = createQueryKeyStore({
  assignments: {
    user: (userId: MaybeRef<string>) => ({
      queryKey: [userId] as const,
      queryFn: async () => await api.assignments.getByUserId.query({ userId: toValue(userId) }),
    }),
  },
});

export type AssignmentsQueryKeys = inferQueryKeyStore<typeof queries>;
