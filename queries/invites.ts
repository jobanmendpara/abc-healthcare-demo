import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import type { PageParams } from '@supabase/supabase-js';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import { api } from '~/plugins/server';

export const queries = createQueryKeyStore({
  invites: {
    list: (input: MaybeRef<PageParams>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.invites.list.query(toValue(input)),
    }),
  },
});

export type InvitesQueryKeys = inferQueryKeyStore<typeof queries>;
