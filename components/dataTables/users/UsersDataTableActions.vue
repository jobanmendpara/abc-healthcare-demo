<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const emits = defineEmits(['assignments', 'info']);

const actions = [
  {
    label: 'Info',
    action: () => emits('info', props.id),
  },
  {
    label: 'Assignments',
    action: () => emits('assignments', props.id),
  },
];
</script>

<template>
  <div class="space-x-1">
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline">
          &#x2022;
          &#x2022;
          &#x2022;
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          v-for="action in actions"
          class="hover:cursor-pointer"
          @click="action.action"
        >
          {{ action.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
