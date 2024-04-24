<script setup lang="ts">
import type { SubmitAssignmentsEmit } from '~/types';

const props = defineProps({
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
  isFetching: {
    type: Boolean,
    default: true,
  },
  isMutating: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  'update:open': [_newVal: boolean];
  'submit': [_val: SubmitAssignmentsEmit];
}>();

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
</script>

<template>
  <div class="space-y-3">
    <div class="flex w-full justify-evenly gap-1">
      <Card class="w-full p-3">
        <p class="text-lg font-semibold">
          Assignable
        </p>
        <div class="group overflow-y-auto h-full p-2">
          <div
            v-if="props.isFetching"
            class="space-y-3"
          >
            <Skeleton
              v-for="_ in 5"
              class="w-auto h-[20px] rounded-full"
            />
          </div>
          <div
            v-for="item in getSorted(Array.from(assignable.values()))"
            v-else
            :key="item.id"
            class="even:bg-secondary p-1 flex w-full justify-between items-center"
          >
            <p>
              {{ `${item.first_name} ${item.last_name}` }}
            </p>
            <Button @click="addToAssigned(item)">
              +
            </Button>
          </div>
        </div>
      </Card>
      <Card class="w-full p-3">
        <p class="text-lg font-semibold">
          Assigned
        </p>
        <div class="group overflow-y-auto h-full p-2">
          <div
            v-if="props.isFetching"
            class="space-y-3"
          >
            <Skeleton
              v-for="_ in 5"
              class="w-auto h-[20px] rounded-full"
            />
          </div>
          <div
            v-for="item in getSorted(Array.from(assigned.values()))"
            v-else
            :key="item.id"
            class="even:bg-secondary p-1 flex w-full justify-between items-center"
          >
            <p>
              {{ item.first_name }} {{ item.last_name }}
            </p>
            <Button @click="addToAssignable(item)">
              -
            </Button>
          </div>
        </div>
      </Card>
    </div>
    <div class="flex-center gap-3">
      <Button
        :disabled="props.isMutating"
        @click="onSubmit"
      >
        Save
      </Button>
      <Button
        variant="outline"
        :disabled="props.isMutating"
        @click="reset"
      >
        Reset
      </Button>
    </div>
  </div>
</template>
