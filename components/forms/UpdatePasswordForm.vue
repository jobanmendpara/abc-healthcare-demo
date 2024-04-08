<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
  username: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['submit']);

const { $api, $toast } = useNuxtApp();

const localUsername = computed(() => props.username);

const schema = z.object({
  ...changePasswordRequestSchema.shape,
  confirmPassword: changePasswordRequestSchema.shape.newPassword,
});

const form = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
});

const { mutate, isPending } = useMutation({
  mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
    await $api.auth.updatePassword.mutate({ newPassword, oldPassword }),
  onSuccess: () => {
    $toast.success('Password updated successfully');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
  onSettled: () => {
    form.resetForm();
  },
});

async function onSubmit() {
  const formValidationResult = await form.validate();

  if (!formValidationResult.valid) {
    if (formValidationResult.errors.oldPassword)
      form.setFieldError('oldPassword', formValidationResult.errors.oldPassword);

    if (formValidationResult.errors.newPassword)
      form.setFieldError('newPassword', formValidationResult.errors.newPassword);

    if (formValidationResult.errors.confirmPassword)
      form.setFieldError('confirmPassword', formValidationResult.errors.confirmPassword);

    return;
  }

  if (!formValidationResult.values) {
    return;
  }

  if (formValidationResult.values?.newPassword !== formValidationResult.values?.confirmPassword) {
    form.setFieldError('confirmPassword', 'Passwords should match');
    $toast.error('Passwords must match');
    return;
  }

  mutate({
    oldPassword: form.values.oldPassword || '',
    newPassword: form.values.newPassword || '',
  });

  form.resetForm();
}
</script>

<template>
  <form
    class="space-y-5"
    @submit.prevent="onSubmit"
  >
    <div class="md:w-1/2 w-full space-y-2">
      <FormField name="username">
        <FormItem v-show="false">
          <FormLabel for="username">
            Email
          </FormLabel>
          <FormControl>
            <Input
              id="username"
              v-model="localUsername"
              autocomplete="username"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="oldPassword"
      >
        <FormItem>
          <FormLabel for="oldPassword">
            Old Password
          </FormLabel>
          <FormControl>
            <Input
              id="oldPassword"
              v-bind="componentField"
              type="password"
              autocomplete="current-password"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="newPassword"
      >
        <FormItem>
          <FormLabel for="newPassword">
            New Password
          </FormLabel>
          <FormControl>
            <Input
              id="newPassword"
              v-bind="componentField"
              type="password"
              autocomplete="new-password"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="confirmPassword"
      >
        <FormItem>
          <FormLabel for="confirmPassword">
            Confirm Password
          </FormLabel>
          <FormControl>
            <Input
              id="confirmPassword"
              v-bind="componentField"
              type="password"
              autocomplete="password"
            />
          </FormControl>
        </FormItem>
      </FormField>
    </div>
    <div class="text-right">
      <Button
        class="md:w-1/4 w-full p-2"
        type="submit"
        :disabled="isPending"
      >
        Submit
      </Button>
    </div>
  </form>
</template>
