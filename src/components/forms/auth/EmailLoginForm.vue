<script setup lang="ts">
import type { AuthTokenResponse } from '@supabase/supabase-js';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { FormField } from '~/components/ui/form';

const emit = defineEmits(['submit']);

const { $api, $toast } = useNuxtApp();
const { auth } = useSupabaseClient();

const schema = z.object({
  ...emailLoginSchema.shape,
});

const form = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    email: '',
    password: '',
  },
});

const { mutate, isPending } = useMutation({
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

const onSubmit = form.handleSubmit(async (values) => {
  mutate({
    email: values.email,
    password: values.password,
  });

  form.resetForm();
});
</script>

<template>
  <form
    class="space-y-5"
    @submit.prevent="onSubmit"
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
    <Button
      class="mb-4 w-full px-4 py-2 font-bold"
      type="submit"
      :disabled="isPending"
    >
      Sign In with Email
    </Button>
  </form>
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
        onSubmit();
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
        onSubmit();
      }"
    >
      Employee
    </Button>
  </div>
</template>
