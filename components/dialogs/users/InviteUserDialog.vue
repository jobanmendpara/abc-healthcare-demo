<script setup lang="ts">
const props = defineProps({
  role: {
    type: String as PropType<Role>,
    default: 'employee',
  },
});
const isOpen = ref(false);
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Invite
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        Invite User
      </DialogTitle>
      <DialogDescription>
        Please enter an email and select a role to send an invite to a new user.
      </DialogDescription>
      <InviteUserForm
        :role="props.role"
        @submit="isOpen = false"
      />
    </DialogContent>
  </Dialog>
</template>
