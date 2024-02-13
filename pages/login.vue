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
    phone: '',
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
    navigateTo({ name: 'Home' });
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const phoneLoginMutation = useMutation({
  mutationFn: async (phone: string) => await $api.auth.loginWithPhone.mutate({ phone }),
  onSuccess: () => {
    navigateTo({
      name: 'Verify',
      query: {
        phone: form.values.phone,
      },
    });
    $toast.success('Check your phone for a confirmation code');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

async function onEmailLoginSubmit() {
  const { valid: isEmailValid } = await form.validateField('email');
  // const { valid: isPasswordValid } = await form.validateField('password');

  // if (!isEmailValid || !isPasswordValid) {
  //   $toast.error('Invalid form data');
  //   return;
  // }

  emailLoginMutation.mutate({
    email: form.values.email!,
    password: form.values.password!,
  });
}

async function onPhoneLoginSubmit() {
  const { valid: isPhoneValid } = await form.validateField('phone');

  if (!isPhoneValid) {
    $toast.error('Invalid form data');
    return;
  }

  if (!form.values.phone) {
    $toast.error('Invalid form data');
    return;
  }

  phoneLoginMutation.mutate(form.values.phone!);
}

definePageMeta({
  layout: 'default',
  name: 'Login',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
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
    <p class="py-5 text-center">
      or
    </p>
    <form
      class="space-y-5"
      @submit.prevent="onPhoneLoginSubmit"
    >
      <FormField
        v-slot="{ componentField }"
        name="phone"
      >
        <FormItem>
          <FormLabel
            class="mb-2 block text-sm font-bold"
            for="phone"
          >
            Phone Number
          </FormLabel>
          <FormControl>
            <Input
              id="phone"
              v-bind="componentField"
              type="tel"
              placeholder="1235559999"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <Button class="mb-4 w-full px-4 py-2 font-bold">
        Sign In With Phone
      </Button>
    </form>
  </div>
</template>

<style scoped></style>
