import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import { api } from '~/plugins/server';

export const queries = createQueryKeyStore({
  users: {
    all: null,
    list: (input: MaybeRef<UsersListParams>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.users.list.query(toValue(input)),
    }),
    ids: (input: MaybeRef<string[]>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.users.getById.query({ userIds: toValue(input) }),
    }),
  },
});

export type UserQueryKeys = inferQueryKeyStore<typeof queries>;
