<script setup lang="ts">
import type { AuthTokenResponse } from '@supabase/supabase-js';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { EmailLogin } from '~/types';
import { emailLoginSchema, phoneLoginSchema } from '~/types';

const { $api, $toast } = useNuxtApp();
const { auth } = useSupabaseClient();

const formSchema = z.object({
  ...emailLoginSchema.shape,
  ...phoneLoginSchema.shape,
});

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    email: '',
    password: '',
  },
});

const emailLoginMutation = useMutation({
  mutationFn: async (data: EmailLogin) => await $api.auth.loginWithEmail.mutate(data) as AuthTokenResponse['data'],
  onSuccess: async (data) => {
    if (!data.session)
      throw new Error('No session found in response');

    await auth.setSession(data.session);

    $toast.success('Logged in successfully');
    form.resetForm();
    navigateTo({ name: 'home' });
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

async function onEmailLoginSubmit() {
  const { valid: isEmailValid } = await form.validateField('email');
  const { valid: isPasswordValid } = await form.validateField('password');

  if (!isEmailValid || !isPasswordValid) {
    $toast.error('Invalid form data');
    return;
  }

  emailLoginMutation.mutate({
    email: form.values.email!,
    password: form.values.password!,
  });
}

definePageMeta({
  layout: 'default',
  middleware: ['verify-magic-link', 'verify-pre-auth'],
  name: 'Login',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md space-y-2 sm:w-full md:w-1/3">
    <form
      class="space-y-5"
      @submit.prevent="onEmailLoginSubmit"
    >
      <FormField
        v-slot="{ componentField }"
        name="email"
      >
        <FormItem>
          <FormLabel for="email">
            Email
          </FormLabel>
          <FormControl>
            <Input
              id="email"
              v-bind="componentField"
              class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
              type="email"
              placeholder="johndoe@acme.org"
              autocomplete="username"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="password"
      >
        <FormItem>
          <FormLabel
            class="mb-2 block text-sm font-bold"
            for="password"
            autocomplete="current-password"
          >
            Password
          </FormLabel>
          <FormControl>
            <Input
              id="password"
              v-bind="componentField"
              class="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
              type="password"
              placeholder="********"
              autocomplete="current-password"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <Button class=" mb-4 w-full px-4 py-2 font-bold">
        Sign In with Email
      </Button>
    </form>
    <div class="text-center">
      <NuxtLink
        class="hover:cursor-pointer px-4 py-2"
        :to="{ name: 'PasswordlessLogin' }"
      >
        Passwordless Login
      </NuxtLink>
    </div>
    <div
      v-if="useRuntimeConfig().public.nodeEnv === 'development'"
      class="flex p-5 justify-center gap-5"
    >
      <Button
        @click="() => {
          form.setValues({
            email: useRuntimeConfig().public.adminEmail as unknown as string,
            password: useRuntimeConfig().public.adminPassword as unknown as string,
          });
          onEmailLoginSubmit();
        }"
      >
        Admin
      </Button>
      <Button
        @click="() => {
          form.setValues({
            email: useRuntimeConfig().public.employeeEmail as unknown as string,
            password: useRuntimeConfig().public.employeePassword as unknown as string,
          });
          onEmailLoginSubmit();
        }"
      >
        Employee
      </Button>
    </div>
    <div
      class="text-center w-full hover:underline"
    >
      <NuxtLink
        :to="{ name: 'index' }"
      >
        Back
      </NuxtLink>
    </div>
  </div>
</template>
