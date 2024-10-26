<script setup lang="ts">
const props = defineProps({
  timecard: {
    type: Object as PropType<Timecard>,
    required: true,
  },
});
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger>
      <Button variant="outline">
        Edit
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogTitle>
        Edit Timecard
      </AlertDialogTitle>
      <AlertDialogDescription>
        Update the current timecard details
      </AlertDialogDescription>
      <EditTimecardForm
        :timecard="props.timecard"
      />
    </AlertDialogContent>
    <AlertDialogFooter>
      <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialog>
</template>
