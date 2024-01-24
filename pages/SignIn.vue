<script setup lang="ts">
import type { AuthTokenResponse } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/vue-query';
import type { SignInCredentials } from '~/types';
import { AppRoutes } from '~/types';

const { $server, $toast } = useNuxtApp();
const { auth } = useSupabaseClient();

// WARN: Remove before Prod
const email = ref<string>('app@utyme.io');
const password = ref<string>('dev');
const phone = ref<string>('6208039700');

const signInWithCredentialsMutation = useMutation({
  mutationFn: async (credentials: SignInCredentials) => await $server.auth.signInWithCredentials.mutate({ credentials }) as AuthTokenResponse['data'],
  onSuccess: async (data) => {
    if (!data.user && !data.session)
      throw new Error('No user or session returned from Supabase');

    await auth.setSession(data.session);

    navigateTo(AppRoutes.HOME);
  },
  onError: (error) => {
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 2000,
    });
  },
});

const signInWithPhoneMutation = useMutation({
  mutationFn: async (phone: string) => await $server.auth.signInWithPhone.mutate({ phone }) as AuthTokenResponse['data'],
  onSuccess: async (data) => {
    if (!data.user && !data.session)
      throw new Error('No user or session returned from Supabase');

    await auth.setSession(data.session);

    navigateTo(AppRoutes.HOME);
  },
  onError: (error) => {
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 2000,
    });
  },
});

definePageMeta({
  layout: 'default',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <form>
      <div class="mb-4">
        <label
          class="mb-2 block text-sm font-bold"
          for="email"
        >
          Email
        </label>
        <InputText
          id="email"
          v-model="email"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          type="email"
          placeholder="johndoe@acme.org"
        />
      </div>
      <div class="mb-6">
        <label
          class="mb-2 block text-sm font-bold"
          for="password"
        >
          Password
        </label>
        <InputText
          id="password"
          v-model="password"
          class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          type="password"
          placeholder="********"
        />
      </div>
      <Button
        class="focus:shadow-outline mb-4 w-full rounded bg-primary-500 px-4 py-2 font-bold hover:bg-primary-700 focus:outline-none"
        label="Sign In"
        :loading="signInWithCredentialsMutation.status.value === 'pending' && signInWithPhoneMutation.status.value === 'pending'"
        @click="signInWithCredentialsMutation.mutate({ email, password, phone: '' })"
      />
    </form>
    <p class="my-2 text-center">
      or
    </p>
    <form>
      <div class="mb-4">
        <label
          class="mb-2 block text-sm font-bold"
          for="phone"
        >
          Phone Number
        </label>
        <InputText
          id="phone"
          v-model="phone"
          class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
          type="tel"
          placeholder="1235559999"
        />
      </div>
      <Button
        class="focus:shadow-outline mb-4 w-full rounded bg-slate-400 px-4 py-2 font-bold hover:bg-slate-700 focus:outline-none"
        label="Sign In with Phone"
        :loading="signInWithCredentialsMutation.status.value === 'pending' && signInWithPhoneMutation.status.value === 'pending'"
        @click="signInWithPhoneMutation.mutate(phone)"
      />
    </form>
  </div>
</template>

<style scoped></style>
