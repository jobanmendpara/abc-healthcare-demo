<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['deleteInvite']);

const actions = [
  {
    label: 'Delete',
    action: () => emit('deleteInvite', props.id),
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
          class="bg-destructive hover:cursor-pointer"
          @click="action.action"
        >
          {{ action.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
