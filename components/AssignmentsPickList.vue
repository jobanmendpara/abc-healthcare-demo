<script setup lang="ts">
import type { Assignment, AssignmentUser } from '~/types';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  assigned: {
    type: Array as PropType<Assignment[]>,
    default: () => [],
  },
  assignable: {
    type: Array as PropType<AssignmentUser[]>,
    default: () => [],
  },
});

const emit = defineEmits([]);

const isOpen = useVModel(props, 'open', emit);
</script>

<template>
  <Dialog
    v-model:open="isOpen"
  >
    <DialogContent
      class="min-w-[80vw]"
    >
      <DialogHeader>
        <DialogTitle>
          Assignments
        </DialogTitle>
        <DialogDescription>
          Mange this user's assignments
        </DialogDescription>
      </DialogHeader>
      <div class="min-h-[80vh] flex w-full justify-evenly">
        <div class="w-full">
          <p>Assignable - {{ assignable.length }}</p>
          <div>
            <p
              v-for="item in assignable"
              :key="item.id"
            >
              {{ item.name }}
            </p>
          </div>
        </div>
        <div class="w-full">
          <p>Assigned - {{ assigned.length }}</p>
          <div>
            <p
              v-for="assignment in assigned"
              :key="assignment.id"
            >
              {{ assignment.client.name }}
            </p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button>
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
