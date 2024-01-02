<script setup lang="ts">
import type { UserRoles } from '~/models';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String as PropType<UserRoles>,
    default: 'employee',
  },
});
const emit = defineEmits(['hide']);

const { $client } = useNuxtApp();
const visible = ref<boolean>(false);
const email = ref<string>('');

function submit() {
  $client.users.invite.mutate({ email: email.value, role: props.role });
  email.value = '';
  emit('hide');
}

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
    @hide="$emit('hide')"
  >
    <form
      class="flex min-h-fit w-fit flex-col gap-2"
      @submit.prevent="submit"
    >
      <InputText
        id="email"
        v-model="email"
        class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        type="email"
        placeholder="johndoe@acme.org"
      />
      <Button
        icon="pi pi-send"
        icon-pos="right"
        class="w-full p-2 hover:bg-primary-700"
        label="Send Invite"
        type="submit"
      />
    </form>
  </Dialog>
</template>

<style scoped></style>
