<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const { $api, $toast } = useNuxtApp();

const form = useForm({
  validationSchema: toTypedSchema(z.object({
    email: z.string().email(),
  })),
  initialValues: {
    email: '',
  },
});

const { mutate } = useMutation({
  mutationFn: async (email: string) => await $api.auth.getMagicLink.mutate({ email }),
  onSuccess: () => {
    $toast.success('Password reset email sent');
    navigateTo({ name: 'Login' });
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

async function onSubmit() {
  const formValidationResults = await form.validate();

  if (!formValidationResults.valid) {
    $toast.error('Please enter a valid email');
    return;
  }
  if (!form.values.email)
    return;

  mutate(form.values.email);
}

definePageMeta({
  name: 'PasswordlessLogin',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-1/3">
    <form
      class="space-y-4"
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
              type="email"
              placeholder="Email"
              required
            />
          </FormControl>
        </FormItem>
      </FormField>
      <Button
        class="w-full p-2"
        type="submit"
      >
        Send Magic Link
      </Button>
    </form>
  </div>
</template>

<style scoped></style>
