<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import type { User } from '~/types';

const props = defineProps({
  open: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits([]);

const queryClient = useQueryClient();
const { formData } = useForm();
const { isOpen } = useDialog();

function useForm() {
  const formData = ref(initUser());

  return {
    formData,
  };
}

function useDialog() {
  const isOpen = useVModel(props, 'open', emit);

  watchEffect(() => {
    if (isOpen.value)
      formData.value = queryClient.getQueryData<User>(['user'])!;
    else
      formData.value = initUser();
  });

  return {
    isOpen,
  };
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        Account Settings
      </DialogHeader>
      <form>
        <Input v-model="formData.first_name" />
      </form>
    </DialogContent>
  </Dialog>
</template>
