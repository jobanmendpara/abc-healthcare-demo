import { defineStore } from 'pinia';
import { QueryClient, useQuery } from '@tanstack/vue-query';
import type { Invite, Role, SignUpFormData, User } from '~/types';

export const useUsersStore = defineStore('users', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
      },
    },
  });
  const { $client, $toast } = useNuxtApp();
  const users = ref<Record<string, User>>({});
  const invites = ref<Record<string, Invite>>({});

  async function create(userId: string, role: Role, formData: SignUpFormData): Promise<void> {
    try {
      const user: User = {
        id: userId,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.credentials.email,
        is_active: true,
        role,
        geopoint_id: formData.geopoint.id,
        phone_number: formData.credentials.phone,
      };

      await $client.users.create.mutate({
        users: [user],
      });
    }
    catch (error) {
      $toast.add({
        severity: 'error',
        summary: 'Error',
        detail: getUnknownErrorMessage(error),
        life: 2000,
      });
    }
  }

  async function fetch(userId: string): Promise<User | void> {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['users', userId],
        queryFn: async () => await $client.users.fetch.query({ userId }),
      });

      const user = data.users[userId];
      delete data.users[userId];

      users.value = data.users;
      if (data.invites)
        invites.value = data.invites;

      return user;
    }
    catch (error) {
      $toast.add({
        severity: 'error',
        detail: getUnknownErrorMessage(error),
        life: 2000,
      });
    }
  }

  return {
    create,
    fetch,
    invites,
    users,
  };
});
