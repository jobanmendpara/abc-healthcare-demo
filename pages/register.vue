<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

const username = ref<string>('');
const password = ref<string>('');
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-12 px-4 py-16">
    <h1
      class="text-5xl font-extrabold tracking-tight text-[#858585] sm:text-[5rem]"
    >
      Register
    </h1>
    <InputText
      v-model="username"
      type="text"
      placeholder="Email"
    />
    <InputText
      v-model="password"
      type="password"
      placeholder="Password"
    />
  </div>
</template>

<style scoped></style>
