<script setup lang="ts">
import type { Assignment } from '~/types';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<{
      available: Record<string, { id: string, name: string }>
      assignments: Record<string, Assignment>
    }>,
    default: () => ({
      available: {},
      assignments: {},
    }),
  },
});
const emit = defineEmits(['hide']);
const visible = ref<boolean>(false);
const localAvailableAssignments = ref<{ id: string, name: string }[]>([]);
const localAssignments = ref<Assignment[]>([]);

const localData = computed(() => [
  localAvailableAssignments.value,
  localAssignments.value,
]);

watch(
  () => props.isVisible,
  (newValue) => {
    visible.value = newValue;
  },
);
watch(
  () => props.data,
  (newValue) => {
    localAssignments.value = Object.values(newValue.assignments);
    localAvailableAssignments.value = Object.values(newValue.available);
  },
);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Assignments"
    @hide="$emit('hide')"
  >
    <PickList v-model="localData">
      <template #sourceheader>
        Available
      </template>
      <template #targetheader>
        Assigned
      </template>
      <template #item="slotProps">
        {{ slotProps.item.id }}
      </template>
    </PickList>
  </Dialog>
</template>

<style scoped></style>
