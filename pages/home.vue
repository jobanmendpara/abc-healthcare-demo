<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import type { CompleteUser, UserSettings } from '~/types';

type UserQueryData = CompleteUser & {
  settings: Omit<UserSettings, 'id'>
};

const userData = ref(useQueryClient().getQueryData(['user']) as UserQueryData);

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
