import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import type { PageParams } from '@supabase/supabase-js';
import { api } from '~/plugins/server';
import { useSupabaseUser } from '#imports';
import type { UsersListParams } from '~/types';

const supabaseUser = useSupabaseUser();

export const queries = createQueryKeyStore({
  app: {
    user: (userId: string) => ({
      queryKey: [userId],
      queryFn: async () => {
        const userResponse = await api.users.getById.query({ userIds: [userId] });
        const userSettingsResponse = await api.userSettings.get.query({ userIds: [userId] });

        const user = userResponse.data.get(supabaseUser.value!.id);
        if (!user)
          throw new Error('User not found');
        const settings = userSettingsResponse.userSettings.find(setting => setting.id === user.id);
        if (!settings)
          throw new Error('User settings not found');

        return {
          ...user,
          settings,
        };
      },
    }),
  },
  assignments: {
    user: (userId: Ref<string>) => ({
      queryKey: [userId],
      queryFn: async () => await api.assignments.getByUserId.query({ userId: userId.value }),
    }),
  },
  invites: {
    list: (input: ComputedRef<PageParams>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.invites.list.query(input.value),
    }),
  },
  users: {
    all: null,
    list: (input: ComputedRef<UsersListParams>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.users.list.query(input.value),
    }),
  },
});
export type QueryKeys = inferQueryKeyStore<typeof queries>;
