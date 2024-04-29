<script setup lang="ts">
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const { client, isPending } = defineProps({
  isPending: {
    type: Boolean,
    default: false,
  },
  client: {
    type: Object as PropType<Partial<User>>,
    default: initUser(),
  },
});

const emit = defineEmits(['submit']);

const formSchema = toTypedSchema(z.object({
  first_name: z.string().min(1).max(255),
  middle_name: z.string().min(1).max(255).nullish(),
  last_name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone_number: phoneSchema,
  geopoint: geopointSchema,
}));

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    ...client,
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  emit('submit', values);
  form.resetForm();
});
</script>

<template>
  <form
    class="mb-4 space-y-8"
    @submit.prevent="onSubmit"
  >
    <div class="flex justify-between gap-3">
      <FormField
        v-slot="{ componentField }"
        name="first_name"
      >
        <FormItem class="w-full">
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
        <FormItem class="w-full">
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
        <FormItem class="w-full">
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
      class="text-center"
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
            placeholder="johndoe@mail.com"
          />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="phone_number"
    >
      <FormItem>
        <FormLabel for="phone_number">
          Phone Number
        </FormLabel>
        <FormControl>
          <Input
            id="phone_number"
            v-bind="componentField"
            type="tel"
            placeholder="1234567890"
          />
        </FormControl>
      </FormItem>
    </FormField>
    <Button
      class="focus:shadow-outline mb-4 w-full rounded px-4 py-2 font-bold focus:outline-none"
      type="submit"
      :disabled="isPending"
    >
      Submit
    </Button>
  </form>
</template>
