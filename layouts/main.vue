<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { queries } from '~/queries';

const { $api, $toast, $user } = useNuxtApp();
const { auth } = useSupabaseClient();
const queryClient = useQueryClient();

const { isOpen, show } = useAccountSettings();

const { isDarkMode, toggleDarkMode } = useDarkMode();

const { data: user, status } = useQuery({
  ...queries.app.user($user.value!.id),
  refetchOnMount: false,
});

const updateUserMutation = useMutation({
  mutationFn: async (user: Partial<User>) => await $api.users.update.mutate(user),
  onSuccess: () => {
    queryClient.invalidateQueries(queries.app.user($user.value!.id));
    $toast.success('User updated successfully');
    isOpen.value = false;
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const toggleThemeMutation = useMutation({
  mutationFn: async () => await $api.userSettings.update.mutate({
    userSettings: [{ id: $user.value!.id, is_dark_mode: !isDarkMode.value }],
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(queries.app.user($user.value!.id));
  },
  onError: (error) => {
    $toast.error(error);
  },
  onSettled: () => {
    toggleDarkMode(!isDarkMode.value);
  },
});

const signOutMutation = useMutation({
  mutationFn: async () => await auth.signOut({ scope: 'local' }),
});

function useDarkMode() {
  const isDarkMode = useDark();
  const toggleDarkMode = useToggle(isDarkMode);

  return {
    isDarkMode,
    toggleDarkMode,
  };
}

function useAccountSettings() {
  const isOpen = ref(false);

  function show() {
    isOpen.value = true;
  }

  return {
    isOpen,
    show,
  };
}
</script>

<template>
  <body
    v-if="status === 'success' && user"
    :class="`${isDarkMode ? 'dark' : ''} h-screen overflow-hidden mx-auto grid grid-cols-[auto,1fr] gap-2`"
  >
    <NavBar
      :is-dark-mode="isDarkMode"
      :role="user.role"
      @sign-out="signOutMutation.mutate"
      @toggle-dark-mode="toggleThemeMutation.mutate"
      @show-account-settings="show"
    />
    <main class="container pt-3 overflow-auto scrollbar-width-none">
      <slot />
      <AccountSettings
        v-model:open="isOpen"
        :user="user"
        @submit="(user: Partial<User>) => updateUserMutation.mutate(user)"
      />
    </main>
  </body>
</template>

<style scoped>
.scrollbar-width-none {
  scrollbar-width: none;
}
</style>
