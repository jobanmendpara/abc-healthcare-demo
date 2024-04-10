<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { queries } from '~/queries';
import { invitesTableSchema } from '~/types';

const props = defineProps({
  role: {
    type: String as PropType<Role>,
    default: 'employee',
  },
});
const emit = defineEmits(['submit']);

const { $api, $toast } = useNuxtApp();
const queryClient = useQueryClient();

const formSchema = toTypedSchema(invitesTableSchema);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    id: crypto.randomUUID(),
    role: props.role,
  },
});

const { mutate, isPending } = useMutation({
  mutationFn: async (inviteFormData: Invite) => await $api.auth.invite.mutate(inviteFormData),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queries.invites.list._def,
    });
    form.resetForm();
    $toast.success('Invite sent');
  },
  onError: (error) => {
    $toast.error(error);
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
    class="space-y-4"
    @submit.prevent="onSubmit"
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
      :disabled="isPending"
    >
      Send Invite
    </Button>
  </form>
</template>
