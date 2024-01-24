<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { usePrimeVue } from 'primevue/config';
import type { CompleteUser, UserSettings } from '~/types';
import { AppRoutes } from '~/types';
import { buildCompleteUser } from '~/utils/objectBuilders';

const { $server } = useNuxtApp();
const { auth } = useSupabaseClient();
const primeVue = usePrimeVue();
const queryClient = useQueryClient();

const isDarkMode = ref(false);

const userQuery = useQuery({
  queryKey: ['user'],
  queryFn: async (): Promise<CompleteUser & { settings: Omit<UserSettings, 'id'> }> => {
    const userResponse = await $server.users.get.query({ userIds: [useSupabaseUser().value!.id] });
    const geopointReponse = await $server.geopoints.get.query({ ids: [userResponse.users[0].geopoint_id] });
    const settingsResponse = await $server.userSettings.get.query({ userIds: [useSupabaseUser().value!.id] });

    if (isDarkMode.value !== settingsResponse.userSettings[0].is_dark_mode)
      applyTheme(settingsResponse.userSettings[0].is_dark_mode);

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
  mutationFn: async (newSettings: Omit<UserSettings, 'id'>) => await $server.userSettings.update.mutate({
    userSettings: [{ id: useSupabaseUser().value!.id, ...newSettings }],
  }),
  onSuccess(_data, variables, _context) {
    queryClient.invalidateQueries({
      queryKey: ['user'],
    });
    applyTheme(variables.is_dark_mode);
  },
});

const signOutMutation = useMutation({
  mutationFn: async () => await auth.signOut(),
  onSuccess() {
    queryClient.invalidateQueries({
      queryKey: ['user'],
    });
    navigateTo(AppRoutes.SIGN_IN);
  },
});

const navItems = ref([
  {
    label: 'Home',
    route: AppRoutes.HOME,
    icon: 'pi pi-home',
    visible: true,
    command: () => {
      navigateTo(AppRoutes.HOME);
    },
  },
  {
    label: 'People',
    route: AppRoutes.PEOPLE,
    icon: 'pi pi-user',
    visible: () => {
      if (!userQuery.data.value)
        return false;

      return userQuery.data.value.role === 'admin';
    },
    command: () => {
      navigateTo(AppRoutes.PEOPLE);
    },
  },
]);

function applyTheme(isDark: boolean) {
  isDarkMode.value = isDark;

  primeVue.changeTheme(
    `lara-${!isDarkMode.value ? 'dark' : 'light'}-green`,
    `lara-${!isDarkMode.value ? 'light' : 'dark'}-green`,
    `theme`,
  );
}
</script>

<template>
  <body class="container mx-auto grid h-screen grid-cols-[auto,1fr] gap-2 p-2">
    <div class="overflow-y-auto">
      <Menu :model="navItems">
        <template #item="{ item }">
          <NuxtLink :to="item.route">
            <div class="p-2">
              <i :class="item.icon" />
              {{ item.label }}
            </div>
          </NuxtLink>
        </template>
        <template #end>
          <hr class="mb-2">
          <div class="inline-flex w-full items-center justify-center gap-2 p-2">
            <i class="pi pi-sun" />
            <InputSwitch
              v-model="isDarkMode"
              @click="() => toggleThemeMutation.mutate({ is_dark_mode: !isDarkMode })"
            />
          </div>
          <NuxtLink
            to="/"
            @click="signOutMutation.mutate"
          >
            <div class="inline-flex w-full items-center justify-between gap-2 p-2 hover:bg-red-500">
              <p>Sign Out</p>
              <i class="pi pi-sign-out" />
            </div>
          </NuxtLink>
        </template>
      </Menu>
    </div>
    <main>
      <Card class="min-h-full overflow-y-auto">
        <template #content>
          <slot v-if="userQuery.status.value === 'success'" />
        </template>
      </Card>
    </main>
  </body>
</template>

<style scoped></style>
