<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { InviteFormData, Role } from '~/types';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String as PropType<Role>,
    default: '',
  },
});
const emit = defineEmits(['hide']);
const { $toast } = useNuxtApp();
const queryClient = useQueryClient();
const { $server } = useNuxtApp();
const visible = ref<boolean>(false);
const email = ref<string>('');

const { mutate: submit, isPending } = useMutation({
  mutationFn: async (inviteFormData: Omit<InviteFormData, 'id'>) => await $server.auth.invite.mutate({
    id: useSupabaseUser().value!.id,
    ...inviteFormData,
  }),
  onMutate: (inviteFormData) => {
    if (!validateEmail(inviteFormData.email))
      throw new Error('Please enter a valid email.');

    return inviteFormData;
  },
  onSuccess() {
    queryClient.invalidateQueries({
      queryKey: ['people'],
    });
    email.value = '';
    emit('hide');

    $toast.add({
      severity: 'success',
      summary: 'Invite Sent',
      detail: 'The invite has been sent.',
    });
  },
  throwOnError: true,
});

watch(
  () => props.isVisible,
  (newValue) => {
    visible.value = newValue;
  },
);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Invite User"
    :closable="!isPending"
    @hide="$emit('hide')"
  >
    <form
      class="space-y-4"
      @submit.prevent="submit({ email, role })"
    >
      <InputText
        id="email"
        v-model="email"
        class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
        type="email"
        placeholder="johndoe@acme.org"
      />
      <Button
        icon="pi pi-send"
        icon-pos="right"
        class="w-full p-2 hover:bg-primary-700"
        label="Send Invite"
        type="submit"
        :loading="isPending"
      />
    </form>
  </Dialog>
</template>

<style scoped></style>
