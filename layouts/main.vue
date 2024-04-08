<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { queries } from '~/queries';

const { $api, $toast, $user } = useNuxtApp();
const { auth } = useSupabaseClient();
const queryClient = useQueryClient();

const { isDarkMode, toggleDarkMode } = useDarkMode();

const { data: user, status } = useQuery({
  ...queries.app.user($user.value!.id),
  staleTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
});

const signOutMutation = useMutation({
  mutationFn: async () => await auth.signOut({ scope: 'local' }),
  onSuccess: () => {
    $toast.success('Signed out successfully');
    navigateTo({ name: 'Login' });
  },
});

function useDarkMode() {
  const isDarkMode = useDark();
  const toggleDarkMode = useToggle(isDarkMode);

  return {
    isDarkMode,
    toggleDarkMode,
  };
}

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
</script>

<template>
  <body
    v-if="status === 'success' && user"
    :class="`${isDarkMode ? 'dark' : ''} h-screen overflow-hidden mx-auto grid grid-rows-[auto,1fr] grid-cols-1 md:grid-rows-1 md:grid-cols-[auto,1fr]`"
  >
    <NavBar
      :is-dark-mode="isDarkMode"
      :role="user.role"
      @sign-out="signOutMutation.mutate"
      @toggle-dark-mode="toggleThemeMutation.mutate"
    />
    <main class="container pt-3 overflow-auto scrollbar-width-none">
      <slot />
    </main>
  </body>
</template>

<style scoped>
.scrollbar-width-none {
  scrollbar-width: none;
}
</style>
