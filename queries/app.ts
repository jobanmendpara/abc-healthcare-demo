import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import { api } from '~/plugins/server';

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
});

export type AppQueryKeys = inferQueryKeyStore<typeof queries>;
