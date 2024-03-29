<script setup lang="ts">
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  initialAssigned: {
    type: Array as PropType<AssignmentUser[]>,
    default: () => [],
  },
  initialAssignable: {
    type: Array as PropType<AssignmentUser[]>,
    default: () => [],
  },
  user: {
    type: Object as PropType<User>,
    default: () => initUser(),
  },
});

const emit = defineEmits(['update:open', 'submit']);

const isOpen = useVModel(props, 'open', emit);

const computedAssigned = computed(() => new Map<string, AssignmentUser>(props.initialAssigned.map(assignment => [assignment.id, assignment])));
const computedAssignable = computed(() => new Map<string, AssignmentUser>(props.initialAssignable.map(assignment => [assignment.id, assignment])));

const assigned = ref<Map<string, AssignmentUser>>(computedAssigned.value);
const assignable = ref<Map<string, AssignmentUser>>(computedAssignable.value);

function addToAssigned(assignmentUser: AssignmentUser) {
  assigned.value.set(assignmentUser.id, assignmentUser);
  assignable.value.delete(assignmentUser.id);
}

function addToAssignable(assignmentUser: AssignmentUser) {
  assignable.value.set(assignmentUser.id, assignmentUser);
  assigned.value.delete(assignmentUser.id);
}

function onSubmit() {
  const netAddedUserIds = computed(() => {
    const initialAssignedIds = new Set(props.initialAssigned.map(assignment => assignment.id));
    const currentAssignedIds = new Set(Array.from(assigned.value.keys()));

    return new Set([...currentAssignedIds].filter(id => !initialAssignedIds.has(id)));
  });

  const netRemovedUserIds = computed(() => {
    const initialAssignedIds = new Set(props.initialAssigned.map(assignment => assignment.id));
    const currentAssignedIds = new Set(Array.from(assigned.value.keys()));

    return new Set([...initialAssignedIds].filter(id => !currentAssignedIds.has(id)));
  });

  emit('submit', {
    added: Array.from(netAddedUserIds.value),
    removed: Array.from(netRemovedUserIds.value),
  });
}

function getSorted(list: AssignmentUser[]) {
  return list.sort((a, b) => a.last_name.localeCompare(b.last_name));
}

function reset() {
  assigned.value = new Map<string, AssignmentUser>(props.initialAssigned.map(assignment => [assignment.id, assignment]));
  assignable.value = new Map<string, AssignmentUser>(props.initialAssignable.map(assignment => [assignment.id, assignment]));
}

watch(
  () => props.initialAssignable || props.initialAssigned,
  () => {
    reset();
  },
);

watchEffect(() => {
  if (isOpen.value) {
    reset();
  }
});
</script>

<template>
  <Dialog
    v-model:open="isOpen"
    @update:open="reset"
  >
    <DialogContent>
      <form
        class="space-y-9"
        @submit.prevent="onSubmit"
      >
        <DialogHeader>
          <DialogTitle class="text-xl">
            Assignments
          </DialogTitle>
          <DialogDescription class="text-lg">
            Manage this user's assignments
          </DialogDescription>
        </DialogHeader>
        <div class="flex w-full justify-evenly gap-1">
          <div class="w-full">
            <p class="text-lg">
              Assignable
            </p>
            <div class="group overflow-y-auto h-full border border-secondary p-2">
              <div
                v-for="item in getSorted(Array.from(assignable.values()))"
                :key="item.id"
                class="even:bg-secondary p-1 flex w-full justify-between items-center"
              >
                <p>
                  {{ `${item.first_name} ${item.last_name}` }}
                </p>
                <Button @click="addToAssigned(item)">
                  Add
                </Button>
              </div>
            </div>
          </div>
          <div class="w-full">
            <p class="text-lg">
              Assigned
            </p>
            <div class="group overflow-y-auto h-full border border-secondary p-2">
              <div
                v-for="item in getSorted(Array.from(assigned.values()))"
                :key="item.id"
                class="even:bg-secondary p-1 flex w-full justify-between items-center"
              >
                <p>
                  {{ item.first_name }} {{ item.last_name }}
                </p>
                <Button @click="addToAssignable(item)">
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">
            Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
