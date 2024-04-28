<script setup lang="ts">
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import queries from '~/queries';

const emit = defineEmits(['submit']);

const { $api, $toast } = useNuxtApp();
const queryClient = useQueryClient();

const formSchema = toTypedSchema(z.object({
  first_name: z.string().min(1).max(255),
  middle_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone_number: phoneSchema,
  geopoint: geopointSchema,
}));

const form = useForm({
  validationSchema: formSchema,
});

const { mutate, isPending } = useMutation({
  mutationFn: async (user: Partial<User>) => {
    const newClient: User = {
      id: crypto.randomUUID(),
      first_name: user.first_name ?? '',
      middle_name: user.middle_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      geopoint: user.geopoint ?? initGeopoint(),
      phone_number: user.phone_number ?? '',
      role: 'client',
      is_active: true,
    };

    await $api.users.create.mutate({ user: newClient });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queries.users.list._def,
    });
    $toast.success('Client created');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  mutate(values);
  emit('submit');
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

<style scoped></style>
