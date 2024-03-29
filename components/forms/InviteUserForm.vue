<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { invitesTableSchema } from '~/types';

const props = defineProps({
  open: {
    type: Boolean,
    required: false,
  },
  isMutationPending: {
    type: Boolean,
    required: false,
  },
  role: {
    type: String as PropType<Role>,
    default: 'employee',
  },
});

const emit = defineEmits(['submit', 'update:open']);

const formSchema = toTypedSchema(invitesTableSchema);

const form = useForm({
  validationSchema: formSchema,
});

const { isOpen } = useDialog();

function useDialog() {
  const isOpen = ref(false);

  return {
    isOpen,
  };
}

async function onSubmit() {
  form.setFieldValue('id', crypto.randomUUID());
  const inviteValidationResult = await form.validate();

  if (!inviteValidationResult.valid)
    return;
  if (!inviteValidationResult.values)
    return;

  emit('submit', inviteValidationResult.values);
  isOpen.value = false;
}

watchEffect(() => {
  if (isOpen.value) {
    form.setValues({
      role: props.role,
    });
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Invite
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        Invite User
      </DialogTitle>
      <DialogDescription>
        Please enter an email and select a role to send an invite to a new user.
      </DialogDescription>
      <form
        class="space-y-4"
        @submit.prevent="onSubmit()"
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
                class="w-full px-3 py-2"
                type="email"
                placeholder="johndoe@acme.org"
              />
            </FormControl>
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="role"
        >
          <FormItem>
            <FormLabel for="role">
              Role
            </FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem
                      v-for="role in ['employee', 'admin']"
                      :key="role"
                      :value="role"
                    >
                      {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </FormField>
        <Button
          class="w-full p-2"
          type="submit"
          :disabled="props.isMutationPending"
        >
          Send Invite
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
