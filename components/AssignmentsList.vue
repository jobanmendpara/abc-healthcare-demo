<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { PickListMoveToSourceEvent, PickListMoveToTargetEvent } from 'primevue/picklist';
import type { CompleteUser, CreateAssignmentsFormData, DeleteAssignmentsFormData } from '~/types';

interface UpdateAssignmentsFormData {
  id: string
  assign: string[]
  unassign: string[]
};

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<{
      id: string
      assignments: Record<string, CompleteUser>
      available: Record<string, CompleteUser>
    }>,
    default: () => ({
      id: '',
      available: {},
      assignments: {},
    }),
  },
});
const emit = defineEmits(['hide']);

const queryClient = useQueryClient();
const { $server, $toast } = useNuxtApp();
const { hide, isDialogVisible } = useDialog();
const { localData, add, remove, reset, toAdd, toRemove } = usePickList();

const { mutate: submit } = useMutation({
  mutationFn: async (data: UpdateAssignmentsFormData) => {
    const { id, assign, unassign } = data;

    const assignmentRequest: CreateAssignmentsFormData = {
      userId: id,
      usersToAssign: assign,
    };
    const unassignmentRequest: DeleteAssignmentsFormData = {
      userId: id,
      usersToUnassign: unassign,
    };

    if (data.assign.length > 0)
      await $server.assignments.create.mutate({ items: [assignmentRequest] });

    if (data.unassign.length > 0)
      await $server.assignments.delete.mutate({ items: [unassignmentRequest] });
  },
  onSuccess: () => {
    $toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Assignments updated successfully',
      life: 2000,
    });
    queryClient.invalidateQueries({
      queryKey: ['people'],
    });
  },
  onSettled: () => {
    hide();
  },
  onError: (error) => {
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getUnknownErrorMessage(error),
      life: 2000,
    });
  },
});

function useDialog() {
  const isDialogVisible = ref<boolean>(false);

  function hide() {
    isDialogVisible.value = false;
    emit('hide');
    reset();
  }

  watchEffect(() => {
    isDialogVisible.value = props.isVisible;
  });

  return {
    isDialogVisible,
    hide,
  };
}

function usePickList() {
  const availableAssignments = ref<CompleteUser[]>([]);
  const assignments = ref<CompleteUser[]>([]);
  const localData = ref([
    availableAssignments.value,
    assignments.value,
  ]);
  const toAdd = ref<Set<string>>(new Set());
  const toRemove = ref<Set<string>>(new Set());

  function add(event: PickListMoveToTargetEvent) {
    const selections = event.items as CompleteUser[];

    selections.forEach((selection) => {
      toRemove.value.delete(selection.id);
      toAdd.value.add(selection.id);
    });
  }

  function remove(event: PickListMoveToSourceEvent) {
    const selections = event.items as CompleteUser[];

    selections.forEach((selection) => {
      toAdd.value.delete(selection.id);
      toRemove.value.add(selection.id);
    });
  }

  function reset() {
    assignments.value = Object.values(props.data.assignments);
    availableAssignments.value = Object.values(props.data.available);
  }

  watchEffect(() => {
    availableAssignments.value = Object.values(props.data.available);
    assignments.value = Object.values(props.data.assignments);
  });

  watchEffect(() => {
    localData.value = [
      availableAssignments.value,
      assignments.value,
    ];
  });

  return {
    localData,
    add,
    remove,
    reset,
    toAdd,
    toRemove,
  };
}
</script>

<template>
  <Dialog
    v-model:visible="isDialogVisible"
    modal
    header="Assignments"
    :maximizable="true"
    @hide="hide"
  >
    <form
      class="space-y-4 h-full flex flex-col"
      @submit.prevent="submit({ id: props.data.id, assign: Array.from(toAdd), unassign: Array.from(toRemove) })"
    >
      <PickList
        v-model="localData"
        class="w-full h-full px-3 py-2 border border-gray-500 rounded-md"
        data-key="id"
        :move-up-button-props="{ disabled: true, class: 'my-2 hidden' }"
        :move-down-button-props="{ disabled: true, class: 'my-2 hidden' }"
        :move-top-button-props="{ disabled: true, class: 'my-2 hidden' }"
        :move-bottom-button-props="{ disabled: true, class: 'my-2 hidden' }"
        :move-to-target-props="{ disabled: false, class: 'my-2' }"
        :move-to-source-props="{ disabled: false, class: 'my-2' }"
        :move-all-to-target-props="{ disabled: true, class: 'my-2 hidden' }"
        :move-all-to-source-props="{ disabled: true, class: 'my-2 hidden' }"
        :striped-rows="true"
        @move-to-target="(event) => add(event)"
        @move-to-source="(event) => remove(event)"
      >
        <template #sourceheader>
          Assignable
        </template>
        <template #targetheader>
          Assigned
        </template>
        <template #item="slotProps">
          {{ `${slotProps.item.last_name}, ${slotProps.item.first_name}` }}
        </template>
      </PickList>
      <div class="w-full inline-flex justify-end">
        <Button
          icon="pi pi-save"
          icon-pos="right"
          class="w-auto p-2 hover:bg-primary-700"
          type="submit"
          label="Save"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped></style>
