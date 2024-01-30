<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import type { UserQueryData } from '~/types';

const userData = computed(() => useQueryClient().getQueryData(['user']) as UserQueryData);

definePageMeta({
  layout: 'main',
});
</script>

<template>
  <div class="text-center">
    <h1 class="text-left text-2xl font-semibold">
      Hi, {{ userData.first_name }}
    </h1>
  </div>
</template>

<style scoped></style>
