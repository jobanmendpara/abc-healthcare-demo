import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import type { PageParams } from '@supabase/supabase-js';
import type { DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker';
import { api } from '~/plugins/server';
import { useSupabaseUser } from '#imports';
import type { UsersListParams } from '~/types';

const supabaseUser = useSupabaseUser();
const supabase = useSupabaseClient();

export const queries = createQueryKeyStore({
  app: {
    user: (userId: MaybeRef<string>) => ({
      queryKey: [userId] as const,
      queryFn: async () => {
        const userResponse = await api.users.getById.query({ userIds: [toValue(userId)] });
        const userSettingsResponse = await api.userSettings.get.query();
        const assignments = await api.assignments.getByUserId.query({ userId: toValue(userId) });

        const user = userResponse.get(supabaseUser.value!.id);
        if (!user) {
          supabase.auth.signOut();
          throw new Error('User not found');
        }
        const settings = userSettingsResponse.userSettings.find(setting => setting.id === user.id);
        if (!settings) {
          supabase.auth.signOut();
          throw new Error('User settings not found');
        }

        return {
          ...user,
          assignments: assignments.assigned as Assignment[],
          settings,
        };
      },
    }),
  },
  assignments: {
    user: (userId: MaybeRef<string>) => ({
      queryKey: [userId] as const,
      queryFn: async () => await api.assignments.getByUserId.query({ userId: toValue(userId) }),
    }),
  },
  invites: {
    list: (input: MaybeRef<PageParams>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.invites.list.query(toValue(input)),
    }),
  },
  timecards: {
    active: (userId: MaybeRef<string>) => ({
      queryKey: [userId] as const,
      queryFn: async () => await api.timecards.getActive.query(),
    }),
    list: (input: MaybeRef<PageParams & { dateRange: DatePickerRangeObject }>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.timecards.list.query({
        dateRange: {
          start: toValue(input).dateRange.start.toString(),
          end: toValue(input).dateRange.end.toString(),
        },
      }),
    }),
  },
  users: {
    all: null,
    list: (input: MaybeRef<UsersListParams>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.users.list.query(toValue(input)),
    }),
    id: (input: MaybeRef<string[]>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.users.getById.query({ userIds: toValue(input) }),
    }),
  },
});
export type QueryKeys = inferQueryKeyStore<typeof queries>;
