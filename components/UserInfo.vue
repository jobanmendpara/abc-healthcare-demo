<script setup lang="ts">
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { User } from '~/types';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object as PropType<User>,
    default: () => initUser(),
  },
});

const emit = defineEmits(['deleteUser', 'update:open', 'updateUser']);

const { $toast } = useNuxtApp();
const { copy, email, isOpen } = useDialog();

const isClientEditFormOpen = ref(false);

const formSchema = toTypedSchema(z.object({
  first_name: z.string().min(1).max(255),
  middle_name: z.string().nullable().optional(),
  last_name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone_number: phoneSchema,
  geopoint: geopointSchema,
}));

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    first_name: props.user.first_name,
    middle_name: props.user.middle_name,
    last_name: props.user.last_name,
    email: props.user.email.length > 0 ? props.user.email : undefined,
    phone_number: props.user.phone_number,
    geopoint: props.user.geopoint,
  },
  keepValuesOnUnmount: true,
});

function useDialog() {
  const isOpen = useVModel(props, 'open', emit);

  function copy(value: string) {
    navigator.clipboard.writeText(value);
    $toast.success('Copied to clipboard');
  };

  function email(email: string) {
    window.open(`mailto:${email}`);
  }

  return {
    copy,
    email,
    isOpen,
  };
}

async function onEditUserSubmit() {
  const formValidationResult = await form.validate();

  if (!formValidationResult.valid) {
    if (formValidationResult.errors.first_name)
      $toast.error(formValidationResult.errors.first_name);

    if (formValidationResult.errors.last_name)
      $toast.error(formValidationResult.errors.last_name);

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
  };

  emit('updateUser', payload);
  isOpen.value = false;
  isClientEditFormOpen.value = false;
}

watchEffect(() => {
  if (isClientEditFormOpen.value === false) {
    form.resetForm({
      values: {
        first_name: props.user.first_name,
        middle_name: props.user.middle_name,
        last_name: props.user.last_name,
        email: props.user.email.length > 0 ? props.user.email : undefined,
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
      <DialogHeader>
        <DialogTitle>
          {{ `${props.user.last_name}, ${props.user.first_name}` }}
        </DialogTitle>
        <DialogDescription>
          <div
            class="inline-flex items-center gap-2 hover:cursor-pointer"
            @click="copy(user.id)"
          >
            <p>
              <b>ID:</b> {{ user.id }}
            </p>
            <Icon name="lucide:copy" />
          </div>
        </DialogDescription>
      </DialogHeader>
      <div>
        <div class="flex items-center gap-2">
          <b>Email: </b>
          <div
            v-if="user.email.length > 0"
            class="inline-flex items-center gap-2 hover:cursor-pointer"
            @click="copy(user.email)"
          >
            <p>{{ user.email }}</p>
            <Icon name="lucide:copy" />
          </div>
          <div
            v-if="user.email.length > 0"
            class="hover:cursor-pointer"
          >
            <Icon
              name="lucide:mail"
              @click="email(user.email)"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <b>Phone: </b>
          <div
            v-if="user.phone_number.length > 0"
            class="inline-flex items-center gap-2 hover:cursor-pointer"
            @click="copy(user.phone_number)"
          >
            <p>{{ formatToPhone(user.phone_number) }}</p>
            <Icon name="lucide:copy" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <b>Address: </b>
          <div
            v-if="user.geopoint.formatted_address && user.geopoint.formatted_address.length > 0"
            class="inline-flex items-center gap-2 hover:cursor-pointer"
            @click="copy(user.geopoint.formatted_address || '')"
          >
            <p>{{ user.geopoint.formatted_address }}</p>
            <Icon name="lucide:copy" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="destructive">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent. You cannot undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction @click="$emit('deleteUser', user.id)">
                Delete User
              </AlertDialogAction>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog
          v-if="user.role === 'client'"
          v-model:open="isClientEditFormOpen"
        >
          <AlertDialogTrigger>
            <Button variant="secondary">
              Edit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Client</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the client's new information
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form
              class="mb-4 space-y-8"
              @submit.prevent=""
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
            </form>
            <div class="text-center space-x-4">
              <Button
                variant="outline"
                @click="isClientEditFormOpen = false"
              >
                Cancel
              </Button>
              <Button
                @click="onEditUserSubmit"
              >
                Save
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
