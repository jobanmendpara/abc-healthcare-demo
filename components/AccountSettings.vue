<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps({
  open: {
    type: Boolean,
    required: false,
  },
  user: {
    type: Object as PropType<User>,
    required: true,
  },
});

const emit = defineEmits({
  'submit': (value: Partial<User>) => value,
  'showPasswordChange': () => true,
  'update:open': (value: boolean) => value,
});

const { $toast } = useNuxtApp();

const isOpen = useVModel(props, 'open', emit);

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

async function onSubmit() {
  const formValidationResult = await form.validate();

  if (!formValidationResult.valid) {
    if (formValidationResult.errors.first_name)
      $toast.error(formValidationResult.errors.first_name);

    if (formValidationResult.errors.middle_name)
      $toast.error(formValidationResult.errors.middle_name);

    if (formValidationResult.errors.last_name)
      $toast.error(formValidationResult.errors.last_name);

    if (formValidationResult.errors.email)
      $toast.error(formValidationResult.errors.email);

    if (formValidationResult.errors.phone_number)
      $toast.error('Invalid phone number');
    return;
  }

  if (!formValidationResult.values) {
    $toast.error('Invalid form values');
    return;
  }

  const payload: Partial<User> = {
    id: props.user.id,
    first_name: formValidationResult.values.first_name,
    middle_name: formValidationResult.values.middle_name,
    last_name: formValidationResult.values.last_name,
    email: formValidationResult.values.email,
    phone_number: formValidationResult.values.phone_number,
    geopoint: formValidationResult.values.geopoint,
    role: props.user.role,
    is_active: props.user.is_active,
  };

  emit('submit', payload);
}

watchEffect(() => {
  if (isOpen.value === false) {
    form.resetForm({
      values: {
        first_name: props.user.first_name,
        middle_name: props.user.middle_name,
        last_name: props.user.last_name,
        email: props.user.email,
        phone_number: props.user.phone_number,
        geopoint: props.user.geopoint,
      },
    });
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogTitle>
        Account Settings
      </DialogTitle>
      <DialogDescription>
        The information you provide here is viewable by your admin.
      </DialogDescription>
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
        <AddressAutocomplete
          :value="form.values.geopoint"
          @select="(val: Geopoint) => form.setFieldValue('geopoint', val)"
        />
        <Button
          class="w-full p-2"
          type="submit"
        >
          Save
        </Button>
      </form>
      <div class="text-center">
        <Button
          variant="link"
          @click="$emit('showPasswordChange')"
        >
          Change Password
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
