<script setup lang="ts">
import { queries } from '~/queries';

const { $user } = useNuxtApp();

const { data: user, status } = useQuery(queries.app.user($user.value!.id));

definePageMeta({
  layout: 'main',
  name: 'Home',
});
</script>

<template>
  <div
    v-if="status === 'success' && user"
    class="text-center"
  >
    <h1 class="text-left text-2xl font-semibold">
      Hi, {{ user.first_name }}
    </h1>
  </div>
</template>

<style scoped></style>
