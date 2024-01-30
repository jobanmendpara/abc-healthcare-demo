<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { useVModel } from '@vueuse/core';
import type { CompleteUser } from '~/types';

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
  const formData = ref(initCompleteUser());

  return {
    formData,
  };
}

function useDialog() {
  const isOpen = useVModel(props, 'open', emit);

  watchEffect(() => {
    if (isOpen.value)
      formData.value = queryClient.getQueryData<CompleteUser>(['user'])!;
    else
      formData.value = initCompleteUser();
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
