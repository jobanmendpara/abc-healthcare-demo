<script setup lang="ts">
import { useDark } from '@vueuse/core';
import { queries } from '~/queries';

const { $user } = useNuxtApp();

const isDarkMode = useDark();

const { data: user, status } = useQuery({
  ...queries.app.user($user.value!.id),
  staleTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
});
</script>

<template>
  <body
    v-if="status === 'success' && user"
    :class="`${isDarkMode ? 'dark' : ''} h-screen overflow-hidden mx-auto grid grid-rows-[auto,1fr] grid-cols-1 md:grid-rows-1 md:grid-cols-[auto,1fr]`"
  >
    <NavBar
      :role="user.role"
      @toggle-dark-mode="isDarkMode = !isDarkMode"
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
