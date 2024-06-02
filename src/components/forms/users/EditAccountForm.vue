<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import queries from '~/queries';
import { FormField } from '~/components/ui/form';

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    default: initUser(),
  },
});

const emit = defineEmits(['submit']);

const { $api, $toast, $user } = useNuxtApp();
const queryClient = useQueryClient();

const schema = z.object({
  first_name: z.string().min(1).max(255),
  middle_name: z.string().nullable(),
  last_name: z.string().min(1).max(255),
  email: z.string().email(),
  phone_number: phoneSchema,
  geopoint: geopointSchema,
});

const form = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    first_name: props.user.first_name,
    middle_name: props.user.middle_name,
    last_name: props.user.last_name,
    email: props.user.email,
    phone_number: props.user.phone_number,
    geopoint: props.user.geopoint,
  },
  keepValuesOnUnmount: true,
});

const { mutate, isPending } = useMutation({
  mutationFn: async (user: Partial<User>) => await $api.users.updateSelf.mutate(user),
  onSuccess: () => {
    queryClient.invalidateQueries(queries.app.user($user.value!.id));
    $toast.success('User updated successfully');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  const payload: Partial<User> = {
    id: props.user.id,
    first_name: values.first_name,
    middle_name: values.middle_name,
    last_name: values.last_name,
    email: values.email === props.user.email
      ? undefined
      : values.email,
    phone_number: values.phone_number === props.user.phone_number
      ? undefined
      : values.phone_number,
    geopoint: values.geopoint,
  };

  mutate(payload);
});
</script>

<template>
  <form
    class="space-y-5"
    @submit.prevent="onSubmit"
  >
    <div class="flex gap-2">
      <FormField
        v-slot="{ componentField }"
        name="first_name"
      >
        <FormItem>
          <FormLabel for="first_name">
            First Name
          </FormLabel>
          <FormControl>
            <Input
              id="first_name"
              v-bind="componentField"
              type="text"
              autocomplete="name"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="middle_name"
      >
        <FormItem>
          <FormLabel for="middle_name">
            Middle Name
          </FormLabel>
          <FormControl>
            <Input
              id="middle_name"
              v-bind="componentField"
              type="text"
            />
          </FormControl>
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="last_name"
      >
        <FormItem>
          <FormLabel for="last_name">
            Last Name
          </FormLabel>
          <FormControl>
            <Input
              id="last_name"
              v-bind="componentField"
              type="text"
            />
          </FormControl>
        </FormItem>
      </FormField>
    </div>
    <div class="lg:w-1/4 md:w-1/3 w-full space-y-2">
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
            />
          </FormControl>
        </FormItem>
      </FormField>
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
              autocomplete="email"
            />
          </FormControl>
        </FormItem>
      </FormField>
    </div>
    <AddressAutocomplete
      class="md:text-left text-center"
      :value="form.values.geopoint"
      @select="(val: Geopoint) => form.setFieldValue('geopoint', val)"
    />
    <div class="text-right">
      <Button
        class="md:w-1/4 w-full p-2"
        type="submit"
        :disabled="isPending"
      >
        Update Info
      </Button>
    </div>
  </form>
</template>
