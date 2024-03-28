<script setup lang="ts">
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const props = defineProps({
  open: {
    type: Boolean,
    required: false,
  },
  isMutationPending: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits(['submit', 'update:open']);

const formSchema = toTypedSchema(z.object({
  first_name: z.string().min(1).max(255),
  middle_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255),
  phone_number: phoneSchema,
  geopoint: geopointSchema,
}));

const form = useForm({
  validationSchema: formSchema,
});

const isOpen = useVModel(props, 'open', emit);

async function onSubmit() {
  const formValidationResult = await form.validate();

  if (!formValidationResult.valid)
    return;
  if (!formValidationResult.values)
    return;

  emit('submit', formValidationResult.values);
  isOpen.value = false;
}

watchEffect(() => {
  if (isOpen.value === false) {
    form.resetForm();
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Create
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        Create Client
      </DialogTitle>
      <DialogDescription>
        Please enter the client's information
      </DialogDescription>
      <form
        class="mb-4 space-y-8"
        @submit.prevent="onSubmit()"
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
          :value="form.values.geopoint ?? initSignUpFormData().geopoint"
          @select="(val: Geopoint) => form.setFieldValue('geopoint', val)"
        />
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
          :disabled="isMutationPending"
        >
          Submit
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
