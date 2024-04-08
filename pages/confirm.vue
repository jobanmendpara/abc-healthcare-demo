<script setup lang="ts">
import type { AuthTokenResponse } from '@supabase/supabase-js';

definePageMeta({
  name: 'Confirm',
});

const { $api, $toast } = useNuxtApp();
const { auth } = useSupabaseClient();
const route = useRoute();

const { mutate } = useMutation({
  mutationFn: async (email: string) => await $api.auth.confirmEmail.mutate({ email }) as AuthTokenResponse['data'],
  onSuccess: async (data) => {
    if (!data.session)
      throw new Error('No session found in response');

    await auth.setSession(data.session);

    $toast.success('Logged in successfully');
    navigateTo({ name: 'home' });
  },
  onError: (e) => {
    navigateTo({
      name: 'index',
    });
    $toast.error(e.message);
  },
});

onMounted(() => {
  const email = route.query.email;

  if (!email) {
    navigateTo({
      name: 'index',
    });
    return;
  }

  mutate(email.toString());
});
</script>

<template>
  <h1>Redirecting</h1>
</template>

<style scoped></style>
