<script setup lang="ts">
import { isSystemInDarkMode } from '~/utils/general';

onBeforeMount(() => {
  if (isSystemInDarkMode())
    usePrimeVue().changeTheme('lara-light-green', 'lara-dark-green', 'theme');
  else
    usePrimeVue().changeTheme('lara-dark-green', 'lara-light-green', 'theme');
});
</script>

<template>
  <body class="container mx-auto">
    <slot />
  </body>
</template>
