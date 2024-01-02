<script setup lang="ts">
useHead({
  title: 'uTyme',
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

definePageMeta({
  layout: 'default',
});
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-16">
    <h1 class="text-5xl font-extrabold text-slate-400 sm:text-[5rem]">
      u <span class="text-glow text-primary-500">·</span>
      <span class="text-slate-700">Tyme</span>
    </h1>
    <NuxtLink
      class="rounded-lg bg-surface-500 px-4 py-2 text-white hover:bg-primary-500"
      to="/signin"
    >
      Sign In
    </NuxtLink>
  </div>
</template>
