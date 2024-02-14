<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
  open: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits(['submit']);

const { isOpen } = useDialog();

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

function useDialog() {
  const isOpen = useVModel(props, 'open', emit);

  return {
    isOpen,
  };
}

const isFormValid = computed(() => form.errors.value.oldPassword
  || form.errors.value.newPassword
  || form.errors.value.confirmPassword,
);

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

  emit('submit', {
    oldPassword: form.values.oldPassword,
    newPassword: form.values.newPassword,
  });

  form.resetForm();
}

watchEffect(() => {
  if (isOpen.value === false) {
    form.resetForm({
      values: {
      },
    });
  }
});

watchEffect(() => {
  if (form.values.confirmPassword !== form.values.newPassword) {
    form.setFieldError('confirmPassword', 'Passwords do not match');
  }

  if (form.values.newPassword === form.values.oldPassword) {
    form.setFieldError('newPassword', 'New password must be different from old password');
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        Change Password
      </DialogHeader>
      <form
        class="space-y-5"
        @submit.prevent="onSubmit"
      >
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
        <Button
          class="w-full p-2"
          type="submit"
          :disabled="isFormValid"
        >
          Save
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>
