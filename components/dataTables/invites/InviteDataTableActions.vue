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
        <div
          v-for="action in actions"
          :key="action.label"
        >
          <DropdownMenuItem
            class="bg-destructive text-destructive-foreground hover:cursor-pointer"
            @click="action.action"
          >
            {{ action.label }}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
