<script setup lang="ts">
definePageMeta({
  layout: 'main',
});

const store = useAppStore();
</script>

<template>
  <div class="text-center">
    <h1 class="text-left text-2xl font-semibold">
      Hi, {{ store.user.first_name }}
    </h1>
  </div>
</template>

<style scoped></style>
