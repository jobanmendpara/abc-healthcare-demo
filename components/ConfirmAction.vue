<script setup lang="ts">
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  header: {
    type: String,
    default: '',
  },
  prompt: {
    type: String,
    default: '',
  },
  severity: {
    type: String as PropType<'danger' | 'warning' | 'success'>,
    default: '',
  },
});
const emit = defineEmits(['confirm', 'hide']);

const visible = ref(false);

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
    :header="props.header"
    @hide="$emit('hide')"
  >
    <form
      class="space-y-4"
      @submit.prevent="$emit('confirm')"
    >
      <p
        :class="props.severity === 'danger' ? 'text-red-500' : ''"
      >
        {{ props.prompt }}
      </p>
      <Button
        class="w-full p-2"
        label="Confirm"
        type="submit"
        :severity="props.severity"
      />
    </form>
  </Dialog>
</template>

<style scoped></style>
