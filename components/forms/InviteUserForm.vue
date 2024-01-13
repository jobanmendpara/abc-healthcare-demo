<script setup lang="ts">
import type { Role } from '~/types';
import { useAuthStore } from '~/stores';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String as PropType<Role>,
    default: 'employee',
  },
});
const emit = defineEmits(['hide']);

const authStore = useAuthStore();
const visible = ref<boolean>(false);
// WARN: Remove before Prod
const email = ref<string>('me@joban.dev');

async function submit(localEmail: string, localRole: Role) {
  await authStore.inviteUser(localEmail, localRole);

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
      class="space-y-4"
      @submit.prevent="submit(email, props.role)"
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
      />
    </form>
  </Dialog>
</template>

<style scoped></style>
