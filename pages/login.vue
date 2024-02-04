<script setup lang="ts">
import type { AuthTokenResponse } from '@supabase/supabase-js';
import type { LoginCredentials } from '~/types';

const { $api, $toast } = useNuxtApp();
const { auth } = useSupabaseClient();

// WARN: Remove before Prod
const email = ref<string>('app@utyme.io');
const password = ref<string>('dev');
const phone = ref<string>('6208039700');

const loginWithCredentialsMutation = useMutation({
  mutationFn: async (credentials: LoginCredentials) => await $api.auth.loginWithCredentials.mutate({ credentials }) as AuthTokenResponse['data'],
  onSuccess: async (data) => {
    if (!data.user && !data.session)
      throw new Error('No user or session returned from Supabase');

    await auth.setSession(data.session);

    $toast.success('Welcome!');
    navigateTo({ name: 'Home' });
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const loginWithPhoneMutation = useMutation({
  mutationFn: async (phone: string) => await $api.auth.loginWithPhone.mutate({ phone }),
  onSuccess: async () => {
    navigateTo({
      name: 'Verify',
      query: { phone: phone.value },
    });
    $toast.success('Please enter the OTP sent to your phone.');
  },
  onError: error => $toast.error(error.message),
});

definePageMeta({
  layout: 'default',
  name: 'Login',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <form @submit.prevent="loginWithCredentialsMutation.mutate({ email, password, phone: '' })">
      <div class="mb-4">
        <Label for="email">
          Email
        </label>
        <Input
          id="email"
          v-model="email"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          type="email"
          placeholder="johndoe@acme.org"
          autocomplete="username"
        />
      </div>
      <div class="mb-6">
        <Label
          class="mb-2 block text-sm font-bold"
          for="password"
          autocomplete="new-password"
        >
          Password
        </Label>
        <Input
          id="password"
          v-model="password"
          class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          type="password"
          placeholder="********"
          autocomplete="current-password"
        />
      </div>
      <Button
        class=" mb-4 w-full px-4 py-2 font-bold"
        :loading="loginWithCredentialsMutation.status.value === 'pending' && loginWithPhoneMutation.status.value === 'pending'"
      >
        Sign In with Email
      </Button>
    </form>
    <p class="my-2 text-center">
      or
    </p>
    <form @submit.prevent="loginWithPhoneMutation.mutate(phone)">
      <div class="mb-4">
        <Label
          class="mb-2 block text-sm font-bold"
          for="phone"
        >
          Phone Number
        </Label>
        <Input
          id="phone"
          v-model="phone"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          type="tel"
          placeholder="1235559999"
        />
      </div>
      <Button
        class="mb-4 w-full px-4 py-2 font-bold"
        :loading="loginWithCredentialsMutation.status.value === 'pending' && loginWithPhoneMutation.status.value === 'pending'"
      >
        Sign In With Phone
      </Button>
    </form>
  </div>
</template>

<style scoped></style>
