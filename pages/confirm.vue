<script setup lang="ts">
definePageMeta({
  name: 'confirm',
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

definePageMeta({
  name: 'confirm',
});
</script>

<template>
  <h1>Redirecting</h1>
</template>

<style scoped></style>
