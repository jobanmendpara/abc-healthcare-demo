<script setup lang="ts">
const emit = defineEmits(['confirm']);
</script>

<template>
  <AlertDialog>
    <div class="w-full flex items-center">
      <AlertDialogTrigger>
        <Button variant="destructive">
          <Icon name="lucide:trash" />
        </Button>
      </AlertDialogTrigger>
    </div>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action is permanent. You cannot undo this action.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction
          variant="destructive"
          @click="emit('confirm')"
        >
          Confirm
        </AlertDialogAction>
        <AlertDialogCancel>
          Cancel
        </AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
