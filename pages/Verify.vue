<script setup lang="ts">
const { $db, $toast, $user } = useNuxtApp();

const token = ref<string>('');
const { phone } = useRoute().query;

async function submit() {
  const { error } = await $db.auth.verifyOtp({
    token: token.value,
    type: 'sms',
    phone: `1${phone!.toString() ?? ''}`,
    options: {
      redirectTo: routesNames.home,
    },
  });

  if (error)
    $toast.error(error.message);
}

definePageMeta({
  middleware: ['verify-sign-in'],
  name: 'Verify',
});

// WARN: Consider a moving redirection to submit()
watchEffect(() => {
  if ($user.value)
    navigateTo({ name: 'Home' });
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <form
      class="space-y-4"
      @submit.prevent="submit"
    >
      <label
        class="mb-2 block text-sm font-bold"
        for="token"
      >
        OTP Token
      </label>
      <Input
        id="token"
        v-model="token"
        class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
        type="password"
        placeholder="123456"
      />
      <Button
        class="focus:shadow-outline mb-4 w-full rounded px-4 py-2 font-bold hover:bg-primary-700 focus:outline-none"
        label="Verify"
        type="submit"
      >
        Verify OTP
      </Button>
    </form>
  </div>
</template>

<style scoped></style>
