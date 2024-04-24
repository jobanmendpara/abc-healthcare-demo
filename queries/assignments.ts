import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import { api } from '~/plugins/server';

export const queries = createQueryKeyStore({
  assignments: {
    assigned: (userId: MaybeRef<string>) => ({
      queryKey: ['user', userId] as const,
      queryFn: async () => await api.assignments.getAssigned.query({ userId: toValue(userId) }),
    }),
    available: (userId: MaybeRef<string>) => ({
      queryKey: ['user', userId] as const,
      queryFn: async () => await api.assignments.getAvailable.query({ userId: toValue(userId) }),
    }),
  },
});

export type AssignmentsQueryKeys = inferQueryKeyStore<typeof queries>;
