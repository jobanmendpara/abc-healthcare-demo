<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const { $api, $toast } = useNuxtApp();
const formSchema = toTypedSchema(signUpFormDataSchema);

const form = useForm({
  validationSchema: formSchema,
  initialValues: initSignUpFormData(),
});

const signUpUserMutation = useMutation({
  mutationFn: async (data: SignUpFormData) => await $api.auth.signUp.mutate(data),
  onSuccess: () => {
    $toast.success('Check your email for a confirmation link.');
    form.resetForm();
    navigateTo({ name: 'index' });
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

async function onSubmit() {
  const signUpValidationResult = await form.validate();

  if (!signUpValidationResult.valid) {
    $toast.error('Invalid form data');
    return;
  }
  if (!signUpValidationResult.values) {
    $toast.error('Invalid form data');
    return;
  }

  signUpUserMutation.mutate(signUpValidationResult.values);
}

definePageMeta({
  layout: 'default',
  middleware: ['verify-invite'],
  name: 'SignUp',
});
</script>

<template>
  <div class="container mx-auto my-16 rounded-lg p-8 shadow-md sm:w-full md:w-2/3">
    <form
      class="mb-4 space-y-8"
      @submit.prevent="onSubmit()"
    >
      <div class="flex justify-between gap-3">
        <FormField
          v-slot="{ componentField }"
          name="first_name"
        >
          <FormItem
            class="w-full"
          >
            <FormLabel for="first_name">
              First Name
            </FormLabel>
            <FormControl>
              <Input
                id="first_name"
                v-bind="componentField"
                type="text"
                placeholder="John"
              />
            </FormControl>
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="middle_name"
        >
          <FormItem
            class="w-full"
          >
            <FormLabel for="middle_name">
              Middle Name
            </FormLabel>
            <FormControl>
              <Input
                id="middle_name"
                v-bind="componentField"
                type="text"
                placeholder="Donald"
              />
            </FormControl>
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="last_name"
        >
          <FormItem
            class="w-full"
          >
            <FormLabel for="last_name">
              Last Name
            </FormLabel>
            <FormControl>
              <Input
                id="last_name"
                v-bind="componentField"
                type="text"
                placeholder="Doe"
              />
            </FormControl>
          </FormItem>
        </FormField>
      </div>
      <AddressAutocomplete
        :value="form.values.geopoint ?? initSignUpFormData().geopoint"
        @select="(val: Geopoint) => form.setFieldValue('geopoint', val)"
      />
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
              placeholder="johndoe@email.com"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="phone"
      >
        <FormItem>
          <FormLabel for="phone">
            Phone Number
          </FormLabel>
          <FormControl>
            <Input
              id="phone"
              v-bind="componentField"
              type="tel"
              placeholder="4045551234"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="password"
      >
        <FormItem>
          <FormLabel for="password">
            Password
          </FormLabel>
          <FormControl>
            <Input
              id="password"
              v-bind="componentField"
              type="password"
              placeholder="********"
              autocomplete="current-password"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <Button
        class="focus:shadow-outline mb-4 w-full rounded px-4 py-2 font-bold focus:outline-none"
        type="submit"
      >
        Sign Up
      </Button>
    </form>
  </div>
</template>

<style scoped></style>
