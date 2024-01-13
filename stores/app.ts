import { defineStore } from 'pinia';
import type { User } from '~/types';

export const useAppStore = defineStore('app', () => {
  const { $toast } = useNuxtApp();

  const user = ref<User>(initUser());
  const isDarkMode = ref<boolean>(false);

  async function hydrate(userId: string) {
    try {
      const response = await useUsersStore().fetch(userId);
      if (!response)
        throw new Error('No user returned.');

      user.value = response;

      $toast.add({
        severity: 'success',
        summary: 'Sign In Successful',
        detail: 'Welcome!',
        life: 2000,
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
  };

  return {
    hydrate,
    isDarkMode,
    user,
  };
});
