<script setup lang="ts">
import type { InviteFormData, Role } from '~/types';

const { $api, $toast, $user } = useNuxtApp();
const queryClient = useQueryClient();
const email = ref<string>('');
const role = ref<Role>('employee');

const { isOpen } = useDialog();

const { mutate: submit, isPending } = useMutation({
  mutationFn: async (inviteFormData: Omit<InviteFormData, 'id'>) => await $api.auth.invite.mutate({
    id: $user.value!.id,
    ...inviteFormData,
  }),
  onMutate: (inviteFormData) => {
    if (!validateEmail(inviteFormData.email))
      throw new Error('Please enter a valid email.');

    return inviteFormData;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: [usersKeys.all],
    });
    email.value = '';
    role.value = 'employee';
    isOpen.value = false;

    $toast.success('Invite sent!');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

function useDialog() {
  const isOpen = ref(false);

  return {
    isOpen,
  };
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Invite
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        Invite User
      </DialogHeader>
      <form
        class="space-y-4"
        @submit.prevent="submit({ email, role })"
      >
        <Label for="email">
          Email
        </Label>
        <Input
          id="email"
          v-model="email"
          class="w-full px-3 py-2"
          type="email"
          placeholder="johndoe@acme.org"
        />
        <Select v-model="role">
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
              <SelectItem
                v-for="role in ['employee', 'admin', 'client']"
                :key="role"
                :value="role"
              >
                {{ role.charAt(0).toUpperCase() + role.slice(1) }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          class="w-full p-2"
          type="submit"
          :disabled="isPending"
        >
          Send Invite
        </Button>
      </form>
      <DialogFooter />
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
