<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Create
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        Create Client
      </DialogTitle>
      <DialogDescription>
        Please enter the client's information
      </DialogDescription>
      <ClientUserForm
        @submit="isOpen = false"
      />
    </DialogContent>
  </Dialog>
</template>
