import { defineStore } from 'pinia';
import { z } from 'zod';
import type { UserRoles } from '~/models';

const { $client } = useNuxtApp();

export const useUsersStore = defineStore('users', () => {
  async function inviteUser(email: string, role: UserRoles): Promise<void> {
    $client.users.invite.mutate({ email, role });
  };
  return { inviteUser };
});
