<script setup lang="ts">
import { AppRoutes } from '~/types';

definePageMeta({
  layout: 'default',
});

useHead({
  title: 'abc Healthcare',
  meta: [
    {
      name: 'description',
      content: 'HR IS App',
    },
  ],
  link: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
  ],
});
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-16">
    <h1 class="text-5xl font-extrabold sm:text-[5rem]">
      abc &#x2022; Healthcare
    </h1>
    <h2 class="text-3xl">As simple as that</h2>
    <NuxtLink
      class="bg-primary text-secondary rounded-lg px-4 py-2"
      :to="AppRoutes.SIGN_IN"
    >
      Sign In
    </NuxtLink>
  </div>
</template>
