<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

const isDarkMode = useDark();

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
      href: 'favicon/favicon.ico',
    },
  ],
});
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-16"
    :class="isDarkMode ? 'dark' : ''"
  >
    <h1 class="text-5xl text-center font-extrabold w-full">
      abc &#x2022; Healthcare
    </h1>
    <h2 class="text-2xl">
      HR Portal
    </h2>
    <NuxtLink
      class="bg-primary hover:cursor-pointer text-secondary rounded-lg px-4 py-2"
      :to="{ name: 'login' }"
    >
      Sign In
    </NuxtLink>
  </div>
</template>
