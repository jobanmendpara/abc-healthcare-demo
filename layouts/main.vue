<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useDark, useToggle } from '@vueuse/core';
import type { CompleteUser, UserSettings } from '~/types';
import { buildCompleteUser } from '~/utils/objectBuilders';

const { $server, $user } = useNuxtApp();
const { auth } = useSupabaseClient();
const queryClient = useQueryClient();

const { isOpen, show } = useAccountSettings();
const isDarkMode = useDark();

const userQuery = useQuery({
  queryKey: ['user'],
  queryFn: async (): Promise<CompleteUser & { settings: Omit<UserSettings, 'id'> }> => {
    const userResponse = await $server.users.get.query({ userIds: [$user.value!.id] });
    const geopointReponse = await $server.geopoints.get.query({ ids: [userResponse.users[0].geopoint_id] });
    const settingsResponse = await $server.userSettings.get.query({ userIds: [$user.value!.id] });

    isDarkMode.value = settingsResponse.userSettings[0].is_dark_mode;

    return {
      ...buildCompleteUser(
        userResponse.users[0],
        Object.values(geopointReponse.geopoints)[0],
      ),
      settings: {
        is_dark_mode: settingsResponse.userSettings[0].is_dark_mode,
      },
    };
  },
  refetchOnMount: true,
  staleTime: Number.POSITIVE_INFINITY,
});

const toggleThemeMutation = useMutation({
  mutationFn: async () => await $server.userSettings.update.mutate({
    userSettings: [{ id: $user.value!.id, is_dark_mode: !isDarkMode.value }],
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['user'],
    });
  },
  onSettled: () => {
    useToggle(!isDarkMode.value);
  },
});

const signOutMutation = useMutation({
  mutationFn: async () => await auth.signOut(),
  onSuccess() {
    queryClient.invalidateQueries({
      queryKey: ['user'],
    });
  },
});

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
  <body :class="`${isDarkMode ? 'dark' : ''} h-screen overflow-hidden mx-auto grid grid-cols-[auto,1fr] gap-2`">
    <NavBar
      :is-dark-mode="isDarkMode"
      :role="userQuery.data.value?.role"
      @sign-out="signOutMutation.mutate"
      @toggle-dark-mode="toggleThemeMutation.mutate"
      @show-account-settings="show"
    />
    <main class="container pt-3 overflow-auto scrollbar-width-none">
      <slot v-if="userQuery.status.value === 'success'" />
      <AccountSettings
        v-model:open="isOpen"
      />
    </main>
  </body>
</template>

<style scoped>
.scrollbar-width-none {
  scrollbar-width: none;
}
</style>
