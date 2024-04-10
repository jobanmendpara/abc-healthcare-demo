<script setup lang="ts">
definePageMeta({
  name: 'Confirm',
});

const { $api, $toast } = useNuxtApp();
const route = useRoute();

const { mutate } = useMutation({
  mutationFn: async (email: string) => await $api.auth.confirmEmail.mutate({ email }),
  onSuccess: async () => {
    $toast.success('Logged in successfully');
  },
  onError: (e) => {
    $toast.error(e.message);
  },
  onSettled: () => {
    navigateTo({
      name: 'index',
    });
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
