<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
</script>

<template>
  <VueQueryDevtools />
  <NuxtLayout>
    <NuxtPage />
    <Toast />
  </NuxtLayout>
</template>
