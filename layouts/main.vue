<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { queries } from '~/queries';

const { $api, $toast, $user } = useNuxtApp();
const { auth } = useSupabaseClient();
const queryClient = useQueryClient();

const { isOpen: isAccountSettingsOpen, show: showAccountSettings } = useDialog();
const { isOpen: isPasswordChangeOpen, show: showPasswordChange } = useDialog();

const { isDarkMode, toggleDarkMode } = useDarkMode();

const { data: user, status } = useQuery({
  ...queries.app.user($user.value!.id),
  refetchOnMount: false,
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

const updateUserMutation = useMutation({
  mutationFn: async (user: Partial<User>) => await $api.users.update.mutate(user),
  onSuccess: () => {
    queryClient.invalidateQueries(queries.app.user($user.value!.id));
    $toast.success('User updated successfully');
    isAccountSettingsOpen.value = false;
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const updatePasswordMutation = useMutation({
  mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }) =>
    await $api.auth.updatePassword.mutate({ newPassword, oldPassword }),
  onSuccess: () => {
    $toast.success('Password updated successfully');
    isPasswordChangeOpen.value = false;
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

watchEffect(() => {
  if (isPasswordChangeOpen.value) {
    isAccountSettingsOpen.value = false;
  }
});
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
      @show-account-settings="showAccountSettings"
    />
    <main class="container pt-3 overflow-auto scrollbar-width-none">
      <slot />
      <AccountSettings
        v-model:open="isAccountSettingsOpen"
        :user="user"
        @submit="(user: Partial<User>) => updateUserMutation.mutate(user)"
        @show-password-change="showPasswordChange"
      />
      <PasswordChange
        v-model:open="isPasswordChangeOpen"
        @submit="(val: ChangePasswordRequest) => updatePasswordMutation.mutate(val)"
      />
    </main>
  </body>
</template>

<style scoped>
.scrollbar-width-none {
  scrollbar-width: none;
}
</style>
