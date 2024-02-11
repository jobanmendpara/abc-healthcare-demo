<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  role: {
    type: String as PropType<Role>,
    default: () => 'employee',
  },
});

const emits = defineEmits(['clickMenu', 'clickAssignments', 'clickInfo']);

const actions = [
  {
    label: 'Info',
    action: () => emits('clickInfo', props.id),
    isVisible: true,
  },
  {
    label: 'Assignments',
    action: () => emits('clickAssignments', props.id),
    isVisible: props.role !== 'admin',
  },
];
</script>

<template>
  <div class="space-x-1">
    <DropdownMenu @update:open="$emit('clickMenu', props.id)">
      <DropdownMenuTrigger>
        <Button variant="outline">
          &#x2022;
          &#x2022;
          &#x2022;
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div
          v-for="action in actions"
          :key="action.label"
        >
          <DropdownMenuItem
            v-if="action.isVisible"
            class="hover:cursor-pointer"
            @click="action.action"
          >
            {{ action.label }}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
