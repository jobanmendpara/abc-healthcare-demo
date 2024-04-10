<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['verify-magic-link', 'verify-pre-auth'],
  name: 'login',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md space-y-2 sm:w-full md:w-1/3">
    <EmailLoginForm />
    <div class="text-center">
      <NuxtLink
        class="hover:cursor-pointer px-4 py-2"
        :to="{ name: 'passwordlessLogin' }"
      >
        Passwordless Login
      </NuxtLink>
    </div>
    <div class="text-center w-full hover:underline">
      <NuxtLink :to="{ name: 'index' }">
        Back
      </NuxtLink>
    </div>
  </div>
</template>
