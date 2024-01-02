import { defineStore } from 'pinia';
import { z } from 'zod';
import type { User } from '~/models';
import { UserSchema } from '~/models';

const { $client } = useNuxtApp();

export const useAppStore = defineStore('app', () => {
  const user = ref<User>(initUser());

  async function hydrate(userId: string) {
    try {
      const res = await $client.users.get.query({ userIds: [userId] });

      user.value = z.array(UserSchema).parse(res)[0];

      toastSuccess({
        summary: 'Sign In Successful',
        detail: 'Welcome!',
      });
    }
    catch (error) {
      toastError({
        summary: 'Error',
        detail: getUnknownErrorMessage(error),
      });
    }
  };

  return {
    hydrate,
    user,
  };
});
